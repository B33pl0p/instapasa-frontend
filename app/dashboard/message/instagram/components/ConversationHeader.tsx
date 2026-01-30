'use client';

import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Button,
} from '@mui/material';
import { Conversation, Message } from '../types';

interface ConversationHeaderProps {
  conversation: Conversation | undefined;
  messages: Message[];
  businessUsername: string | null;
  onSendQRClick: () => void;
  qrCodesAvailable: boolean;
}

export default function ConversationHeader({
  conversation,
  messages,
  businessUsername,
  onSendQRClick,
  qrCodesAvailable,
}: ConversationHeaderProps) {
  if (!conversation) {
    return null;
  }

  // Get buyer username from participants (find the one that's not the business)
  let buyerUsername = 'Customer';
  
  if (conversation.participants && conversation.participants.length > 0) {
    const buyerParticipant = conversation.participants.find(p => p.username !== businessUsername);
    if (buyerParticipant) {
      buyerUsername = buyerParticipant.username;
    }
  }

  // Fallback: try to get from messages
  if (buyerUsername === 'Customer' && messages && messages.length > 0) {
    for (const message of messages) {
      if (!message.is_from_business && message.from.username) {
        buyerUsername = message.from.username;
        break;
      }
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        flexShrink: 0,
        borderRadius: 0,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            alignItems: 'center', 
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Customer Info */}
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              alignItems: 'center', 
              flex: 1, 
              minWidth: 0,
            }}
          >
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                flexShrink: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                boxShadow: 2,
              }}
            >
              {buyerUsername.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '1.1rem',
                }}
              >
                {buyerUsername}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Instagram Direct
              </Typography>
            </Box>
          </Stack>

          {/* Right: Send QR Button */}
          {qrCodesAvailable && (
            <Button
              onClick={onSendQRClick}
              variant="contained"
              size="medium"
              sx={{
                flexShrink: 0,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                boxShadow: 2,
              }}
            >
              Send QR
            </Button>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}
