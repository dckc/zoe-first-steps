import { E } from '@agoric/eventual-send';

// const { details: X } = assert;

const CosmosHubTestnet = harden({
  keyword: 'Photon',
  denom: 'uphoton',
  decimalPlaces: 6,
});

/**
 * @param {Promise<Home> } homeP
 * @param {DeployPowers} _powers
 * @typedef {{
 *  zoe: ERef<ZoeService>,
 *  pegasusConnections: Array<[string, unknown]>,
 *  board: ERef<Board>,
 *  agoricNames: ERef<NameHub>,
 * }} Home
 */
const deployPeg = async (homeP, _powers) => {
  console.log('awaiting home...');
  const home = await homeP;

  assert(home.pegasusConnections, `home.pegasusConnections power missing`);
  console.log('awaiting pegasusConnections...');
  const connections = await E(home.pegasusConnections).values();
  assert(connections.length > 0, `pegasusConnections nameHub is empty`);
  console.log('pegasusConnections:', connections);
  const [conn] = connections.slice(-1); // last item

  console.log('getting instance, publicFacet');
  /** @type { Instance } */
  const instance = await E(home.agoricNames).lookup('instance', 'Pegasus');
  const pegPub = E(home.zoe).getPublicFacet(instance);

  const { keyword, denom, decimalPlaces } = CosmosHubTestnet;
  const name = `peg-${connections.length}-${denom}`;
  console.log('creating', name);
  const NAT = 'nat'; // AssetKind.NAT from ERTP
  const peg = await E(pegPub).pegRemote(keyword, conn, denom, NAT, {
    decimalPlaces,
  });
  await E(home.scratch).set(name, peg);

  console.log('await brand, issuer, board...');
  const brand = await E(peg).getLocalBrand();
  const issuer = await E(pegPub).getLocalIssuer(brand);
  const issuerBoardId = await E(home.board).getId(issuer);
  console.log({ issuerBoardId }, CosmosHubTestnet);
};

harden(deployPeg);
export default deployPeg;
