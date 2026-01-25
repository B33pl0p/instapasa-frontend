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
      color="error"
      sx={{
        width: '100%',
        textTransform: 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
        padding: '8px 16px',
        '&:hover': {
          backgroundColor: 'error.lighter',
        },
      }}
    >
      Disconnect
    </Button>
  );
};

export default InstagramDisconnectButton;
