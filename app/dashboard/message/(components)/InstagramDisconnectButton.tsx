'use client';

import React from 'react';
import Button from '@mui/material/Button';
import InstagramIcon from '@mui/icons-material/Instagram';

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
    <Button
      variant="outlined"
      startIcon={<InstagramIcon />}
      onClick={handleDisconnect}
      disabled={disabled}
      sx={{
        width: '100%',
        borderColor: '#dc2626',
        color: '#dc2626',
        textTransform: 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
        padding: '8px 16px',
        '&:hover': {
          borderColor: '#b91c1c',
          backgroundColor: '#fef2f2',
        },
        '&:disabled': {
          borderColor: '#cccccc',
          color: '#666666',
        },
      }}
    >
      Disconnect
    </Button>
  );
};

export default InstagramDisconnectButton;
