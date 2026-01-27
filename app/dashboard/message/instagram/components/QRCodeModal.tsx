'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Card,
  CardMedia,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useState } from 'react';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  qrCodes: string[];
  onSelectQR: (qrUrl: string) => Promise<void>;
  loading?: boolean;
}

export default function QRCodeModal({
  open,
  onClose,
  qrCodes,
  onSelectQR,
  loading = false,
}: QRCodeModalProps) {
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!selectedQR) return;
    
    setSending(true);
    try {
      await onSelectQR(selectedQR);
      setSelectedQR(null);
      onClose();
    } finally {
      setSending(false);
    }
  };

  if (qrCodes.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Send Payment QR Code</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            No payment QR codes configured. Please add QR codes in Settings first.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Payment QR Code to Send</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {qrCodes.map((qrUrl, index) => (
              <Card
                key={qrUrl}
                onClick={() => setSelectedQR(qrUrl)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '2px solid',
                  borderColor: selectedQR === qrUrl ? 'primary.main' : 'transparent',
                  backgroundColor: selectedQR === qrUrl ? 'primary.lighter' : 'background.paper',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={qrUrl}
                  alt={`QR Code ${index + 1}`}
                  sx={{
                    height: 150,
                    objectFit: 'cover',
                  }}
                />
                <Box sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    QR Code {index + 1}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={!selectedQR || sending}
          sx={{ position: 'relative' }}
        >
          {sending ? (
            <>
              <CircularProgress size={20} sx={{ position: 'absolute', left: 12 }} />
              <span style={{ visibility: 'hidden' }}>Send QR</span>
            </>
          ) : (
            'Send QR'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
