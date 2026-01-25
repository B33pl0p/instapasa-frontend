'use client';

import { Suspense, useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookMessengerIcon from '@mui/icons-material/Facebook';
import IntegrationCard from './(components)/IntegrationCard';
import { useInstagramAuth } from './(components)/useInstagramAuth';
import { useMessengerAuth } from './(components)/useMessengerAuth';

function MessageContent() {
  const { status: instagramStatus, processOAuthCallback: processInstagramCallback, disconnect: disconnectInstagram } = useInstagramAuth();
  const { status: messengerStatus, processOAuthCallback: processMessengerCallback, disconnect: disconnectMessenger } = useMessengerAuth();
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<'instagram' | 'messenger' | null>(null);

  const handleDisconnectClick = (platform: 'instagram' | 'messenger') => {
    setDisconnectingPlatform(platform);
    setDisconnectDialogOpen(true);
  };

  const handleDisconnectConfirm = async () => {
    if (disconnectingPlatform === 'instagram') {
      await disconnectInstagram();
    } else if (disconnectingPlatform === 'messenger') {
      await disconnectMessenger();
    }
    setDisconnectDialogOpen(false);
    setDisconnectingPlatform(null);
  };

  const handleDisconnectCancel = () => {
    setDisconnectDialogOpen(false);
    setDisconnectingPlatform(null);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawHash = window.location.hash;
    const hash = rawHash.startsWith('#') ? rawHash.substring(1) : rawHash;

    if (!hash) return;

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const errorReason = params.get('error_reason');

    const completeLogin = async () => {
      try {
        if (errorReason) {
          return;
        }

        if (!accessToken) {
          return;
        }

        // Try Instagram first, then Messenger
        // The backend should handle which platform based on token/scopes
        try {
          await processInstagramCallback(accessToken);
        } catch {
          // If Instagram fails, try Messenger
          await processMessengerCallback(accessToken);
        }

        // Clear the hash from the URL after processing
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        );
      } catch {
        // Error already handled in processOAuthCallback
      }
    };

    void completeLogin();
  }, [processInstagramCallback, processMessengerCallback]);

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Integrations
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Connect your messaging platforms
        </Typography>
      </Box>

      {/* Integration Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        <Box>
          <IntegrationCard
            name="Messenger"
            status={messengerStatus}
            onDisconnect={() => handleDisconnectClick('messenger')}
            image={
              <FacebookMessengerIcon sx={{ fontSize: 32, color: 'text.primary' }} />
            }
          />
        </Box>

        <Box>
          <IntegrationCard
            name="Instagram"
            status={instagramStatus}
            onDisconnect={() => handleDisconnectClick('instagram')}
            image={
              <InstagramIcon sx={{ fontSize: 32, color: 'text.primary' }} />
            }
          />
        </Box>
      </Box>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={disconnectDialogOpen}
        onClose={handleDisconnectCancel}
        aria-labelledby="disconnect-dialog-title"
        aria-describedby="disconnect-dialog-description"
      >
        <DialogTitle id="disconnect-dialog-title">
          Disconnect {disconnectingPlatform === 'instagram' ? 'Instagram' : 'Messenger'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="disconnect-dialog-description">
            Are you sure you want to disconnect your {disconnectingPlatform === 'instagram' ? 'Instagram' : 'Messenger'} account? You will need to reconnect to access {disconnectingPlatform === 'instagram' ? 'Instagram' : 'Messenger'} messages and features.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDisconnectCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDisconnectConfirm} color="error" variant="contained" autoFocus>
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default function Message() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Integrations
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Loading...
            </Typography>
          </Box>
        </Container>
      }
    >
      <MessageContent />
    </Suspense>
  );
}