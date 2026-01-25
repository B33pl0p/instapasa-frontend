'use client'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InstagramLoginButton from "@/app/(site)/components/instagramLoginButton";
import InstagramDisconnectButton from "./InstagramDisconnectButton";
import MessengerLoginButton from "@/app/(site)/components/messengerLoginButton";
import MessengerDisconnectButton from "./MessengerDisconnectButton";

type IntegrationCardProps = {
  name: string;
  image?: React.ReactNode;
  status: 'connected' | 'connecting' | 'not connected';
  onDisconnect?: () => void;
};

export default function IntegrationCard({
  name,
  image,
  status,
  onDisconnect,
}: IntegrationCardProps) {
  const theme = useTheme();
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
 
  const getStatusColor = (): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    if (isConnected) return 'success';
    if (isConnecting) return 'info';
    return 'default';
  };

  const getStatusDotColor = () => {
    if (isConnected) return 'success.main';
    if (isConnecting) return 'info.main';
    return 'text.disabled';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          borderColor: isConnected ? 'success.light' : 'divider',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with icon and status dot */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {image}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {name}
            </Typography>
          </Stack>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: getStatusDotColor(),
              boxShadow: isConnected ? `0 0 12px ${theme.palette.success.main}60` : 'none',
              transition: 'all 0.3s ease',
            }}
          />
        </Stack>

        {/* Status Chip */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            color={getStatusColor()}
            variant={isConnected ? 'filled' : 'outlined'}
            size="small"
            sx={{ 
              fontWeight: 600,
              minWidth: 120,
            }}
          />
        </Box>

        {/* Action Buttons */}
        {(name === 'Instagram' || name === 'Messenger') && (
          <Box sx={{ mt: 'auto' }}>
            {isConnected ? (
              name === 'Instagram' ? (
                <InstagramDisconnectButton 
                  onDisconnect={onDisconnect || (() => {})} 
                  disabled={isConnecting}
                />
              ) : (
                <MessengerDisconnectButton 
                  onDisconnect={onDisconnect || (() => {})} 
                  disabled={isConnecting}
                />
              )
            ) : (
              name === 'Instagram' ? (
                <InstagramLoginButton disabled={isConnecting} />
              ) : (
                <MessengerLoginButton disabled={isConnecting} />
              )
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

