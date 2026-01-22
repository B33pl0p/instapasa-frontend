'use client'
import InstagramLoginButton from "@/app/(site)/components/instagramLoginButton";
import InstagramDisconnectButton from "./InstagramDisconnectButton";
import MessengerLoginButton from "@/app/(site)/components/messengerLoginButton";
import MessengerDisconnectButton from "./MessengerDisconnectButton";

type IntegrationCardProps = {
  name: string;
  image?: React.ReactNode;
  status: 'connected' | 'connecting' | 'not connected';
  onDisconnect?: () => void;
};

export default function IntegrationCard({
  name,
  image,
  status,
  onDisconnect,
}: IntegrationCardProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
 
  return (
    <div className="w-full max-w-sm rounded-lg bg-white border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            {image}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        </div>
        <span
          className={`h-3 w-3 rounded-full ${
            isConnected ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'
          }`}
        />
      </div>

      <div className="mb-5">
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
            isConnected
              ? 'bg-green-100 text-green-700'
              : isConnecting
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {status}
        </span>
      </div>

      {(name === 'Instagram' || name === 'Messenger') && (
        <div className="mt-4 w-full">
          {isConnected ? (
            name === 'Instagram' ? (
              <InstagramDisconnectButton 
                onDisconnect={onDisconnect || (() => {})} 
                disabled={isConnecting}
              />
            ) : (
              <MessengerDisconnectButton 
                onDisconnect={onDisconnect || (() => {})} 
                disabled={isConnecting}
              />
            )
          ) : (
            name === 'Instagram' ? (
              <InstagramLoginButton disabled={isConnecting} />
            ) : (
              <MessengerLoginButton disabled={isConnecting} />
            )
          )}
        </div>
      )}
    </div>
  );
}

