'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import instagramIcon from '@/public/instagramIcon.svg';
import messengerIcon from '@/public/messengerIcon.svg';
import IntegrationCard from './(components)/IntegrationCard';
import { useInstagramAuth } from './(components)/useInstagramAuth';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

function MessageContent() {
  const { status: instagramStatus, processOAuthCallback, disconnect } = useInstagramAuth();
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

  const handleDisconnectClick = () => {
    setDisconnectDialogOpen(true);
  };

  const handleDisconnectConfirm = async () => {
    setDisconnectDialogOpen(false);
    await disconnect();
  };

  const handleDisconnectCancel = () => {
    setDisconnectDialogOpen(false);
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

        await processOAuthCallback(accessToken);

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
  }, [processOAuthCallback]);

  return (
    <main className="min-h-screen bg-white p-16">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Integrations
      </h1>

      <section className="flex flex-wrap gap-6">
        <IntegrationCard
          name="Messenger"
          status="connected"
          image={
            <Image
              src={messengerIcon}
              alt="Messenger"
              className="h-5 w-5"
            />
          }
        />

        <IntegrationCard
          name="Instagram"
          status={instagramStatus}
          onDisconnect={handleDisconnectClick}
          image={
            <Image
              src={instagramIcon}
              alt="Instagram"
              className="h-5 w-5"
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
          Disconnect Instagram
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="disconnect-dialog-description">
            Are you sure you want to disconnect your Instagram account? You will need to reconnect to access Instagram messages and features.
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