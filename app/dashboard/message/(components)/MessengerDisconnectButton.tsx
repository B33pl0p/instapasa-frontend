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
}
