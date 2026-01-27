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
      sx={{
        flexShrink: 0,
        borderRadius: 0,
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Customer Info */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'primary.main',
                flexShrink: 0,
              }}
            >
              {buyerUsername.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {buyerUsername}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Instagram Direct Message
              </Typography>
            </Box>
          </Stack>

          {/* Right: Send QR Button */}
          {qrCodesAvailable && (
            <Button
              onClick={onSendQRClick}
              variant="contained"
              size="small"
              sx={{
                flexShrink: 0,
                textTransform: 'none',
                fontWeight: 600,
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
