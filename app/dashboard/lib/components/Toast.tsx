'use client';

import { useEffect, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const Toast = ({ message, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(message.id), 300);
    }, message.duration || 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const getStyles = () => {
    switch (message.type) {
      case 'success':
        return { bgcolor: 'success.main', color: 'success.contrastText' };
      case 'error':
        return { bgcolor: 'error.main', color: 'error.contrastText' };
      case 'warning':
        return { bgcolor: 'warning.main', color: 'warning.contrastText' };
      case 'info':
      default:
        return { bgcolor: 'info.main', color: 'info.contrastText' };
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 24 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 24 }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 24 }} />;
      case 'info':
      default:
        return <InfoIcon sx={{ fontSize: 24 }} />;
    }
  };

  return (
    <Box
      sx={{
        ...getStyles(),
        px: 3,
        py: 2,
        borderRadius: 1,
        boxShadow: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        minWidth: 300,
        maxWidth: 'md',
        transition: 'all 0.3s ease',
        transform: isVisible ? 'translateX(0)' : 'translateX(400px)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {getIcon()}
      </Box>
      <Box sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>
        {message.message}
      </Box>
      <IconButton
        size="small"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(message.id), 300);
        }}
        sx={{
          color: 'inherit',
          flexShrink: 0,
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
        }}
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
};



export default Toast;
