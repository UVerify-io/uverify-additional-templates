import {
  Template,
  type UVerifyCertificate,
  type UVerifyCertificateExtraData,
  type UVerifyMetadata,
  type ThemeSettings,
  type UVerifyConfig,
} from '@uverify/core';
import { type JSX, useEffect, useState } from 'react';
import { NetworkType } from '@cardano-foundation/cardano-connect-with-wallet-core';
import axios from 'axios';
import ClaimingPage from './ClaimingPage';
import { type SocialHubData } from './common';
import SocialHub from './SocialHub';
import ClaimUpdateDialog from './ClaimUpdateDialog';
import videoSrc from './assets/t_shirt_spin.mp4';
import LoadingIndicator from './components/LoadingIndicator';
import { ConnectWalletDialog } from './components/ConnectWalletDialog';
import Modal from './components/Modal';
import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet';

const HeartIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="m12.75 20.66 6.184-7.098c2.677-2.884 2.559-6.506.754-8.705-.898-1.095-2.206-1.816-3.72-1.855-1.293-.034-2.652.43-3.963 1.442-1.315-1.012-2.678-1.476-3.973-1.442-1.515.04-2.825.76-3.724 1.855-1.806 2.201-1.915 5.823.772 8.706l6.183 7.097c.19.216.46.34.743.34a.985.985 0 0 0 .743-.34Z" />
  </svg>
);

class SocialHubTemplate extends Template {
  public name = 'SocialHub';
  public whitelist = [
    'addr1qyleluql6elu7sktvncqfufnq675hlt9z922ah9sm45dmp7kjn0vsay0vq28379mczjmglmam3svuxyka0tyw0uchwjqmxmhg3',
    'addr_test1qqleluql6elu7sktvncqfufnq675hlt9z922ah9sm45dmp7kjn0vsay0vq28379mczjmglmam3svuxyka0tyw0uchwjqcsxhyw',
  ];
  public theme: Partial<ThemeSettings> = {
    background:
      'bg-gradient-to-br from-neutral-900 via-indigo-950 to-neutral-800 text-zinc-200',
    colors: {
      pink: {
        50: '252, 243, 248',
        100: '251, 232, 244',
        200: '248, 210, 233',
        300: '244, 173, 214',
        400: '236, 122, 185',
        500: '226, 82, 157',
        600: '209, 49, 125',
        700: '177, 33, 97',
        800: '149, 31, 82',
        900: '125, 30, 71',
        950: '76, 11, 39',
      },
    },
    footer: {
      hide: true,
    },
  };

  public layoutMetadata = {
    batch_ids: 'Connected batch IDs, separated by commas',
    whitelabel: 'A label for subtle UI template changes',
  };

  constructor(uverifyConfig: UVerifyConfig) {
    super(uverifyConfig);
  }

  public render(
    _hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    _extra: UVerifyCertificateExtraData,
  ): JSX.Element {
    const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
    const [isClaimUpdateItemDialogOpen, setIsClaimUpdateItemDialogOpen] =
      useState(false);
    const [socialHubData, setSocialHubData] = useState<SocialHubData>();
    const [claimed, setClaimed] = useState(false);
    const [owner, setOwner] = useState('');
    const [password, setPassword] = useState('');
    const {
      isConnected,
      disconnect,
      usedAddresses,
      unusedAddresses,
      enabledWallet,
    } = useCardano({
      limitNetwork:
        this.uverifyConfig!.networkType === 'mainnet'
          ? NetworkType.MAINNET
          : NetworkType.TESTNET,
    });
    const [isLoading, setIsLoading] = useState(true);
    const userAddress =
      usedAddresses.length > 0 ? usedAddresses[0] : unusedAddresses[0];

    const item = this.uverifyConfig!.searchParams.get('item');
    const backendUrl = this.uverifyConfig!.backendUrl;

    useEffect(() => {
      async function fetchSocialHub() {
        if (item) {
          try {
            const response = await axios.get(
              backendUrl +
                '/api/v1/extension/connected-goods/' +
                metadata.batch_ids +
                '/' +
                item,
            );

            setPassword(item);
            setOwner(response.data.owner || '');
            setSocialHubData({
              ada_handle: response.data.ada_handle,
              email: response.data.email,
              github: response.data.github,
              name: response.data.name,
              picture: response.data.picture,
              subtitle: response.data.subtitle,
              x: response.data.x,
              telegram: response.data.telegram,
              instagram: response.data.instagram,
              discord: response.data.discord,
              reddit: response.data.reddit,
              youtube: response.data.youtube,
              linkedin: response.data.linkedin,
              website: response.data.website,
              itemName: response.data.item_name,
            });

            if (response.data.owner) {
              setClaimed(true);
            }
          } catch (error) {
            console.error('Error fetching socialHub data:', error);
          } finally {
            setIsLoading(false);
          }
        }
      }
      fetchSocialHub();
    }, []);

    const connectButton = isConnected ? (
      <div
        onClick={disconnect}
        className="m-2 text-pink-400 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer hover:bg-pink-200/10 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20"
      >
        <p className="ml-2 text-xs font-bold">Disconnect Wallet</p>
      </div>
    ) : claimed ? (
      <p className="text-white text-sm text-center mt-8">
        If you own this item, you can{' '}
        <span
          className="text-cyan-400 cursor-pointer hover:underline"
          onClick={() => setIsWalletDialogOpen(true)}
        >
          connect your wallet
        </span>{' '}
        to update the social hub.
      </p>
    ) : (
      <div
        onClick={() => setIsWalletDialogOpen(true)}
        className="mt-8 text-blue-400 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer hover:bg-blue-200/10 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20"
      >
        <p className="ml-2 text-xs font-bold">Connect Wallet</p>
      </div>
    );

    const renderUserOptions = () => {
      if (isConnected) {
        if (
          ![...usedAddresses, ...unusedAddresses].includes(owner) &&
          claimed
        ) {
          return (
            <p className="text-white text-sm text-center mt-8 mb-4">
              You are not the owner of this item.
            </p>
          );
        }
        return (
          <div
            onClick={() => {
              setIsClaimUpdateItemDialogOpen(true);
            }}
            className="mt-8 text-blue-400 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer hover:bg-blue-200/10 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20"
          >
            <p className="ml-2 text-xs font-bold">
              {claimed ? 'Update Social Hub' : 'Claim Shirt'}
            </p>
          </div>
        );
      }
      return null;
    };

    const footer = (
      <footer className="flex flex-col items-center p-1 text-white mt-4 mb-2">
        <div className="flex items-center justify-center mt-2 text-xs">
          Created with <HeartIcon className="mx-1" />
          by
          <a
            className="flex items-center justify-center mx-1 text-green-200"
            href="https://cardanofoundation.org/"
          >
            Cardano Foundation
          </a>
          x
          <a
            className="flex items-center justify-center mx-1 text-pink-200"
            href="https://app.uverify.io/"
          >
            UVerify
          </a>
        </div>
      </footer>
    );

    if (socialHubData?.itemName === undefined) {
      if (!this.uverifyConfig!.searchParams.get('item')) {
        return (
          <div className="min-h-screen text-white w-full flex flex-col justify-center items-center">
            <div className="grow" />
            <p className="text-lg font-bold mt-4 w-3/4 text-center">
              This is a valid UVerify certificate, but it uses the Social Hub
              template, which needs a connected item included in your URL.
              Please make sure your URL ends with ?item=ITEM_ID. Try scanning
              the QR code again, or ask the sender to resend the correct link.
            </p>
            <div className="grow" />
            {footer}
          </div>
        );
      }

      if (isLoading) {
        return <LoadingIndicator />;
      }

      return (
        <div className="min-h-screen text-white w-full flex flex-col justify-center items-center">
          <div className="grow" />
          <p className="text-lg font-bold mt-4 w-3/4 text-center">
            This item is not part of the batch or is unrecognized. Please scan
            the QR code again or ask the sender to resend the link.
          </p>
          <div className="grow" />
          {footer}
        </div>
      );
    }

    return (
      <div className="min-h-screen text-white w-full flex flex-col justify-center items-center">
        <div className="flex flex-row items-center justify-center mt-8">
          <h1 className="text-2xl font-bold mr-2">{socialHubData.itemName}</h1>
          <span
            className="select-none text-[0.6rem] align-middle font-medium px-2 py-1 rounded-full border"
            style={{
              backgroundColor: 'rgb(29, 227, 228)',
              color: 'white',
              borderColor: 'rgba(159, 255, 249, 0.6)',
              boxShadow: '0 0 12px 0 rgba(159, 255, 249, 0.5)',
            }}
          >
            {'#' + metadata.whitelabel}
          </span>
        </div>
        <video
          className="w-1/2 h-auto rounded-xl mt-4 max-w-[320px] border-2 border-white/60 shadow-center shadow-white/20"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
        />
        {claimed ? (
          <SocialHub socialHubData={socialHubData} certificate={certificate} />
        ) : (
          <ClaimingPage />
        )}
        <div className="w-full flex flex-col items-center justify-center">
          {isConnected && renderUserOptions()}
          {connectButton}
        </div>

        <ConnectWalletDialog
          isWalletDialogOpen={isWalletDialogOpen}
          setIsWalletDialogOpen={setIsWalletDialogOpen}
          networkType={
            this.uverifyConfig!.networkType === 'mainnet'
              ? NetworkType.MAINNET
              : NetworkType.TESTNET
          }
          background={this.theme.background}
          customWalletExplainer={
            'Connecting your wallet lets you cover transaction fees and unlocks features like claiming or updating your social hub. It also serves as your secure login, giving you seamless access to the platform.'
          }
          cardanoNetwork={this.uverifyConfig!.networkType}
        />

        <ClaimUpdateDialog
          open={isClaimUpdateItemDialogOpen}
          onClose={() => setIsClaimUpdateItemDialogOpen(false)}
          variant={claimed ? 'update' : 'claim'}
          password={password}
          userAddress={userAddress}
          batchId={metadata.batch_ids + ''}
          socialHubData={socialHubData}
          background={this.theme.background || ''}
          enabledWallet={enabledWallet}
          backendUrl={this.uverifyConfig!.backendUrl}
          Modal={Modal}
        />

        <div className="grow" />
        {footer}
      </div>
    );
  }
}

export default SocialHubTemplate;
