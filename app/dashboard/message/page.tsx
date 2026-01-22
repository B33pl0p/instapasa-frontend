'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import instagramIcon from '@/public/instagramIcon.svg';
import messengerIcon from '@/public/messengerIcon.svg';
import IntegrationCard from './(components)/IntegrationCard';
import { useInstagramAuth } from './(components)/useInstagramAuth';
import { useMessengerAuth } from './(components)/useMessengerAuth';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

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
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-1">Connect your messaging platforms</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <IntegrationCard
          name="Messenger"
          status={messengerStatus}
          onDisconnect={() => handleDisconnectClick('messenger')}
          image={
            <Image
              src={messengerIcon}
              alt="Messenger"
              className="h-8 w-8"
            />
          }
        />

        <IntegrationCard
          name="Instagram"
          status={instagramStatus}
          onDisconnect={() => handleDisconnectClick('instagram')}
          image={
            <Image
              src={instagramIcon}
              alt="Instagram"
              className="h-8 w-8"
            />
          }
        />
      </section>

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
    </main>
  );
}

export default function Message() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white p-16">
          <h1 className="mb-6 text-2xl font-semibold text-gray-900">
            Integrations
          </h1>
          <p>Loading...</p>
        </main>
      }
    >
      <MessageContent />
    </Suspense>
  );
}