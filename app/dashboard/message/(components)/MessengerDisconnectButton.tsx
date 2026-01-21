'use client';

import Button from '@mui/material/Button';
import MessageIcon from '@mui/icons-material/Message';

type MessengerDisconnectButtonProps = {
  onDisconnect: () => void;
  disabled?: boolean;
};

export default function MessengerDisconnectButton({
  onDisconnect,
  disabled = false,
}: MessengerDisconnectButtonProps) {
  return (
    <Button
      variant="outlined"
      startIcon={<MessageIcon />}
      onClick={onDisconnect}
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
}
