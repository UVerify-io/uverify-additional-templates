import type { UVerifyCertificate } from '@uverify/core';
import Certificate from './Certificate';

// Payment credential of the Cardano Foundation wallet, the only issuer the
// template accepts. `certificate.address` carries it in the real UI.
const CARDANO_FOUNDATION_PAYMENT_CREDENTIAL = '5a8dd1a6f5208f5fa66f8c3459a40585f9c752f44b909ab77f783ae3';
const OTHER_PAYMENT_CREDENTIAL = '2ab0de52768ed85c3e3574d7c0e65b3f3a286834ef020e8eda307f1d';

function App() {
  // Preview switches: ?preview=hashed shows the privacy-protected state,
  // ?badge=<catalog key> previews another badge, ?backend=<url> points the
  // issuer credential lookup at another backend (for example a mock) and
  // ?issuer=other shows the notice for badges signed by a foreign wallet.
  const previewParams = new URLSearchParams(window.location.search);
  const certificate = new Certificate({
    backendUrl: previewParams.get('backend') ?? 'http://localhost:9090',
    networkType: 'sandbox',
    searchParams: previewParams,
  });
  const hash = 'aecfb5054637aef7551cc388255515399183e3b2fe37b07398a9769dd18f709a';
  const paymentCredential =
    previewParams.get('issuer') === 'other' ? OTHER_PAYMENT_CREDENTIAL : CARDANO_FOUNDATION_PAYMENT_CREDENTIAL;

  // In production uv_url_name holds sha256("<name>~<salt>") and the UI swaps it
  // for the plain name when ?name= matches. The preview passes the plain value.
  const showHashedName = previewParams.get('preview') === 'hashed';
  const metadata = {
    uv_url_name: showHashedName
      ? 'b2ac2ef4d0680c9e2d870a7f5ed79729486fa9e0632f1ce094c542f5499d8f77'
      : 'Niklas Göke',
    badgeId: previewParams.get('badge') ?? 'CASE_STUDY_BLOCKCHAIN_FOR_AI',
    issuedAt: '2026-04-02',
  };

  const uVerifyCertificate: UVerifyCertificate = {
    hash,
    metadata: JSON.stringify(metadata),
    blockHash: '16e061b5f3de8b966f5f64fe4b2dada37f0a06c209f31ab538f250a997211c93',
    blockNumber: 11936558,
    transactionHash: '44268fa73efee7767c6f36434cb4392f446a8bb274da32d9c32657503192df32',
    address: paymentCredential,
    slot: 157145300,
    creationTime: 1743552000000,
    // Enterprise address the backend derives from the payment credential above
    issuer: 'addr1v9dgm5dx75sg7haxd7xrgkdyqkzln36j739epx4h0aur4ccjrz4sj',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f7' }}>
      {certificate.render(hash, metadata, uVerifyCertificate, <></>, {
        hashedMultipleTimes: false,
        firstDateTime: new Date(1743552000000).toDateString(),
        issuer: uVerifyCertificate.issuer,
        serverError: false,
        isLoading: false,
      })}
    </div>
  );
}

export default App;
