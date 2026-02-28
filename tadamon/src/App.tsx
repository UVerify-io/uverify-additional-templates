import type { UVerifyCertificate, UVerifyConfig } from '@uverify/core';
import Certificate from './Certificate';
import { timestampToDateTime } from './utils';

function App() {
  const uverifyConfig: UVerifyConfig = {
    searchParams: new URLSearchParams(window.location.search),
    networkType: 'mainnet',
    backendUrl: 'http://localhost:9090',
  };

  const certificate = new Certificate(uverifyConfig);
  const address = '5df251eda45ede694aa31b70fbc4d75f59a852b0aecf0eac467c7e5b';

  const hash =
    '72799343f99f7d411bb267973bf927cf0c2f31c9bc9975726e52346d71e3c750';

  const metadata = {
    uverify_template_id: 'tadamon',
    cso_name: 'Green Earth Org',
    registration_country: 'Kenya',
    organization_type: 'NGO',
    establishment_date: '2015-06-12T00:00:00.000Z',
    undp_signing_date: '2025-07-15T08:34:21.729Z',
  };

  const uVerifyCertificate: UVerifyCertificate = {
    hash: hash,
    metadata: JSON.stringify(metadata),
    blockHash:
      '8c1c39da354d0e77d6b009cdeea4f9a85bd91c04d63dc6f26d673ad1823f9aee',
    blockNumber: 12127742,
    transactionHash:
      '84c6aade3bda02c6266ac55b7257fcdeebddb7af2ffb08dc6ab2a6def7eac954',
    address: address,
    slot: 161002968,
    creationTime: 1752569259,
    issuer: address,
  };

  const background = certificate.theme.background || 'bg-main-gradient';

  return (
    <div
      className={`min-h-screen ${background} flex items-center justify-center`}
    >
      {certificate.render(hash, metadata, uVerifyCertificate, <></>, {
        hashedMultipleTimes: false,
        firstDateTime: timestampToDateTime(1752569259000),
        issuer: address,
        serverError: false,
        isLoading: false,
      })}
    </div>
  );
}

export default App;
