// @ts-check

import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import path from 'path';

import bundleSource from '@agoric/bundle-source';

import { E } from '@agoric/eventual-send';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKit } from '@agoric/zoe';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const contractPath = `${dirname}/../src/contract.js`;

test('zoe - points for primes', async (t) => {
  const { zoeService } = makeZoeKit(makeFakeVatAdmin().admin);
  const feePurse = E(zoeService).makeFeePurse();
  const zoe = E(zoeService).bindDefaultFeePurse(feePurse);

  const bundle = await bundleSource(contractPath);
  const installation = E(zoe).install(bundle);

  const { publicFacet, instance } = await E(zoe).startInstance(installation);

  const play = async (guess, reward) => {
    const invitation = await E(publicFacet).makeInvitation();

    const seat = E(zoe).offer(
      invitation,
      undefined,
      undefined,
      harden({ guess }),
    );
    const actual = await E(seat).getOfferResult();
    t.is(actual, reward > 0n ? 'win' : 'guess again');

    if (!reward) {
      t.log({ guess, result: actual });
      return;
    }

    const {
      issuers: { Award: awardIssuer },
      brands: { Award: awardBrand },
    } = await E(zoe).getTerms(instance);
    const myPoints = await E(seat).getPayout('Award');
    const howMuch = await E(awardIssuer).getAmountOf(myPoints);

    t.log({ guess, result: actual, value: howMuch.value });
    t.deepEqual(howMuch, { brand: awardBrand, value: reward });
  };
  await play(2n, 1n);
  await play(3n, 2n);
  await play(4n, undefined);
  await play(5n, 3n);
});
