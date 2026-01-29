'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/dashboard/lib/hooks';
import { fetchMessengerConversations } from '@/app/dashboard/lib/slices/messengerMessagesSlice';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function MessengerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get('conversation') || undefined;
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const { conversations, conversationLoading, error, conversationsLoaded } = useAppSelector(
    (state) => state.messengerMessages
  );
  const orders = useAppSelector((state) => state.orders.orders);

  // LAZY LOADING: Only fetch conversations list on mount (lightweight overview)
  useEffect(() => {
    // Only fetch if not already loaded
    if (!conversationsLoaded && !conversationLoading) {
      dispatch(fetchMessengerConversations());
    }
  }, [dispatch, conversationsLoaded, conversationLoading]);

  // Refresh conversations list (no sync, just refresh the list)
  const handleRefresh = async () => {
    try {
      await dispatch(fetchMessengerConversations()).unwrap();
    } catch {
      // Error already handled in Redux
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('conversation', conversationId);
    router.push(`/dashboard/message/messenger?${params.toString()}`);
  };

  const handleBackToList = () => {
    router.push('/dashboard/message/messenger');
  };

  const getParticipantName = (conversation: typeof conversations[0]): string => {
    if (conversation.participants.length === 0) return 'Unknown User';
    // For Messenger, we typically show the first participant that's not the business
    return conversation.participants[0]?.username || conversation.participants[0]?.id || 'Unknown User';
  };

  // Get selected conversation data for mobile header
  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.conversation_id === selectedConversationId)
    : null;
  const selectedParticipantName = selectedConversation 
    ? getParticipantName(selectedConversation)
    : 'Messenger Chats';

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: 'background.default' }}>
      {/* Left Panel - Conversation List (Hidden on mobile when conversation selected) */}
      <Box
        sx={{
          display: { xs: selectedConversationId ? 'none' : 'flex', sm: 'flex' },
          position: 'relative',
          width: { xs: '100%', sm: '320px', md: '320px' },
          flexShrink: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          flexDirection: 'column',
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', backgroundColor: theme.palette.background.paper }}>
          <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: { xs: 0.75, sm: 1 }, py: 0.75, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0 }}>
              Messenger Chats
            </Typography>
            <Tooltip title="Refresh conversations">
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={conversationLoading}
                sx={{
                  color: conversationLoading ? 'text.disabled' : 'text.primary',
                }}
              >
                <RefreshIcon
                  sx={{
                    animation: conversationLoading ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
          
          {conversationLoading ? (
            <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  Loading conversations...
                </Typography>
              </Box>
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', p: 2 }}>
              <Typography variant="caption" color="error" align="center">
                {error}
              </Typography>
            </Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', p: 2 }}>
              <Typography variant="caption" color="textSecondary" align="center">
                No conversations yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {conversations.map((conversation, index) => {
                const participantName = getParticipantName(conversation);
                const isSelected = selectedConversationId === conversation.conversation_id;
                const uniqueKey = conversation.conversation_id || `conv-${index}-${conversation.updated_time}`;
                const buyerId = conversation.buyer_id || conversation.participants[0]?.id;
                const relatedOrder = buyerId ? orders.find(order => order.buyer_id === buyerId) : null;

                return (
                  <Box
                    key={uniqueKey}
                    onClick={() => handleSelectConversation(conversation.conversation_id)}
                    sx={{
                      cursor: 'pointer',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      px: { xs: 0.75, sm: 1 },
                      py: 0.75,
                      transition: 'all 0.2s ease',
                      backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
                      ...(!(isSelected) && {
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                      }),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                      <AccountCircleIcon sx={{ width: 40, height: 40, color: 'text.secondary', flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {participantName}
                          </Typography>
                          <Typography variant="caption" sx={{ ml: 0.5, flexShrink: 0, color: 'text.secondary' }}>
                            {formatTime(conversation.updated_time)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.25,
                            color: 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          {conversation.last_message?.text || 'No messages'}
                        </Typography>
                        {relatedOrder && (
                          <Box sx={{ mt: 0.25, display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <Box
                              component="svg"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              sx={{ width: '0.75rem', height: '0.75rem', color: 'success.main', flexShrink: 0 }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 500, color: 'success.main' }}>
                              {relatedOrder.order_number}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              •
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Rs. {relatedOrder.total.toFixed(0)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Right Panel - Chat Content (Always visible on desktop, hide on mobile when list shown) */}
      <Box
        sx={{
          display: 'flex',
          minWidth: 0,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          backgroundColor: 'background.default',
          position: 'relative',
          height: '100vh',
          maxHeight: '100vh',
          flexDirection: 'column',
        }}
      >
        {/* Mobile Back Header */}
        {selectedConversationId && (
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              backgroundColor: 'background.paper',
              borderBottom: `1px solid ${theme.palette.divider}`,
              px: 1,
              py: 0.5,
              alignItems: 'center',
              gap: 0.5,
              height: '3rem',
            }}
          >
            <IconButton size="small" onClick={handleBackToList}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {selectedParticipantName}
            </Typography>
          </Box>
        )}

        {/* Chat Content */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            pt: selectedConversationId ? { xs: '3rem', md: 0 } : 0,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
