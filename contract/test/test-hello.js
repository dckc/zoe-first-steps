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

test('get, set from hello', async (t) => {
  const { zoeService } = makeZoeKit(makeFakeVatAdmin().admin);
  const feePurse = E(zoeService).makeFeePurse();
  const zoe = E(zoeService).bindDefaultFeePurse(feePurse);

  // pack the contract
  const bundle = await bundleSource(contractPath);

  // install the contract
  const installation = E(zoe).install(bundle);

  const { creatorFacet, publicFacet } = await E(zoe).startInstance(
    installation,
  );

  const actual = await E(publicFacet).get();
  t.is(actual, 'Hello, World!');
  await E(creatorFacet).set('Bye bye!');

  const actual2 = await E(publicFacet).get();
  t.is(actual2, 'Bye bye!');
});
