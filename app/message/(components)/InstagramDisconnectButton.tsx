'use client';

import React from 'react';

type InstagramDisconnectButtonProps = {
  onDisconnect: () => void;
  disabled?: boolean;
};

const InstagramDisconnectButton: React.FC<InstagramDisconnectButtonProps> = ({
  onDisconnect,
  disabled = false,
}) => {
  const handleDisconnect = () => {
    if (disabled) return;
    onDisconnect();
  };

  return (
    <button
      onClick={handleDisconnect}
      disabled={disabled}
      className={`flex w-full items-center justify-center rounded-md px-2 py-2 text-sm font-semibold text-white transition-all duration-200
        bg-red-600 hover:bg-red-700
        ${disabled ? 'cursor-not-allowed opacity-60 hover:bg-red-600' : ''}`}
    >
      <span className="px-2 text-lg">Disconnect</span>
    </button>
  );
};

export default InstagramDisconnectButton;
