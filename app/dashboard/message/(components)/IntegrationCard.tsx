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
    <div className="w-full max-w-xs rounded-xl bg-[#F3E5F5] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {image}
          <p className="text-sm font-medium text-gray-800">{name}</p>
        </div>
        <span
          className={`h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>

      <div className="mb-4">
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
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

