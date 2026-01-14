type IntegrationCardProps = {
  name: string;
  image?: React.ReactNode;
  status: 'connected' | 'not connected';
};

export default function IntegrationCard({
  name,
  image,
  status,
}: IntegrationCardProps) {
  const isConnected = status === 'connected';

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
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {status}
        </span>
      </div>

      <button className="mt-4 w-full rounded-md bg-linear-to-r from-purple-500 to-fuchsia-500 py-2 text-sm font-semibold text-white shadow hover:opacity-90">
        CONNECT
      </button>
    </div>
  );
}

