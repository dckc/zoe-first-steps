// @ts-check
import { Far } from '@agoric/marshal';

const start = async (_zcf) => {
  let value = 'Hello, World!';
  const creatorFacet = Far('hello', {
    set: (v) => (value = v),
  });
  const publicFacet = Far('hello', {
    get: () => value,
  });
  return harden({ creatorFacet, publicFacet });
};

harden(start);
export { start };
