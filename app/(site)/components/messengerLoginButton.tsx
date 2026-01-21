'use client';

import React from 'react';
import Button from '@mui/material/Button';
import MessageIcon from '@mui/icons-material/Message';

const META_APP_ID = '869172442507684';
const REDIRECT_URI = 'https://lakhey.tech/message';

type MessengerLoginButtonProps = {
  disabled?: boolean;
};

const MessengerLoginButton: React.FC<MessengerLoginButtonProps> = ({
  disabled = false,
}) => {
  const handleClick = () => {
    if (disabled) return;

    const url = new URL('https://www.facebook.com/v24.0/dialog/oauth');

    url.searchParams.set('client_id', META_APP_ID);
    url.searchParams.set('display', 'page');
    url.searchParams.set(
      'extras',
      JSON.stringify({ setup: { channel: 'IG_API_ONBOARDING' } })
    );
    url.searchParams.set('redirect_uri', REDIRECT_URI);
    url.searchParams.set('response_type', 'token');
    url.searchParams.set(
      'scope',
      [
        'instagram_basic',
        'instagram_manage_messages',
        'pages_show_list',
        'pages_messaging',
        'business_management',
        
      ].join(',')
    );

    window.location.href = url.toString();
  };

  return (
    <Button
      variant="contained"
      startIcon={<MessageIcon />}
      onClick={handleClick}
      disabled={disabled}
      sx={{
        width: '100%',
        backgroundColor: '#0084ff',
        color: 'white',
        textTransform: 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
        padding: '8px 16px',
        '&:hover': {
          backgroundColor: '#0066cc',
        },
        '&:disabled': {
          backgroundColor: '#cccccc',
          color: '#666666',
        },
      }}
    >
      Connect to Messenger
    </Button>
  );
};

export default MessengerLoginButton;
