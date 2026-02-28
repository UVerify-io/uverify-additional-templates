import type { UVerifyCertificate, UVerifyConfig } from '@uverify/core';
import Certificate from './Certificate';
import { NetworkType } from '@cardano-foundation/cardano-connect-with-wallet-core';

/**
 * This is the main application component that renders the certificate.
 * It will not be used in production, but it is useful for local development and testing.
 *
 * UVerify will just import the Certificate class and use it to render the certificate.
 * You can adjust the metadata and other parameters as needed for your testing purposes.
 */
function App() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  urlSearchParams.append('item', 'dgDP75N0bTTdYV73');

  const uverifyConfig: UVerifyConfig = {
    searchParams: urlSearchParams,
    networkType: NetworkType.MAINNET,
    backendUrl: 'http://localhost:9090',
  };

  const certificate = new Certificate(uverifyConfig);
  const hash =
    '243d719da7c49d8616723e0cfb698611b0f370f0b34a744b2e0e88b55cd86fa8';

  const metadata = {
    batch_ids:
      '2898c9849a49f216e0c389040eda20610819c1e4b64b9d41b2137bc54f374455',
    whitelabel: 'BUIDLER_FEST_2025',
    uverify_template_id: 'socialHub',
  };

  const uVerifyCertificate: UVerifyCertificate = {
    hash: hash,
    address: '3f9ff01fd67fcf42cb64f004f13306bd4bfd651154aedcb0dd68dd87',
    blockHash:
      'ee6d5c3d4d36014243a1962514c4fceb5bb69c0b58ae40e72fec583c2d12c2b3',
    blockNumber: 11765294,
    transactionHash:
      '3a5ef8c0c2d0b658e35db4dd7902c26bdcc5c741d750390cece123bc4d9b6c50',
    slot: 153684421,
    creationTime: 1745250712000,
    metadata: JSON.stringify(metadata),
    issuer: 'addr1vyleluql6elu7sktvncqfufnq675hlt9z922ah9sm45dmpcy8332u',
  };

  const background = certificate.theme.background || 'bg-main-gradient';

  return (
    <div
      className={`min-h-screen ${background} flex items-center justify-center`}
    >
      {certificate.render(hash, metadata, uVerifyCertificate, <></>, {
        hashedMultipleTimes: false,
        firstDateTime: new Date(1745250712000).toDateString(),
        issuer: 'addr1vyleluql6elu7sktvncqfufnq675hlt9z922ah9sm45dmpcy8332u',
        serverError: false,
        isLoading: false,
      })}
    </div>
  );
}

export default App;
