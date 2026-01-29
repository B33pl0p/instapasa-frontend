'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/dashboard/lib/hooks';
import { fetchConversations, refreshAllCachedMessages } from '@/app/dashboard/lib/slices/instagramMessagesSlice';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function InstagramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get('conversation') || undefined;
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const { conversations, businessUsername, conversationLoading, error, conversationsLoaded, messageCache } = useAppSelector(
    (state) => state.instagramMessages
  );
  const orders = useAppSelector((state) => state.orders.orders);

  // LAZY LOADING: Only fetch conversations list on mount (lightweight overview)
  useEffect(() => {
    // Only fetch if not already loaded
    if (!conversationsLoaded && !conversationLoading) {
      dispatch(fetchConversations(false));
    }
  }, [dispatch, conversationsLoaded, conversationLoading]);

  // Refresh conversations list and all cached messages
  const handleRefresh = async () => {
    try {
      // Get IDs of conversations that have cached messages
      const cachedConversationIds = Object.keys(messageCache || {});

      // Refresh conversations list
      await dispatch(fetchConversations(true)).unwrap();

      // Refresh all cached messages
      if (cachedConversationIds.length > 0) {
        await dispatch(refreshAllCachedMessages(cachedConversationIds)).unwrap();
      }
    } catch {
      // Error already handled in Redux
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('conversation', conversationId);
    router.push(`/dashboard/message/instagram?${params.toString()}`);
  };

  const handleBackToList = () => {
    router.push('/dashboard/message/instagram');
  };

  const getParticipantName = (conversation: typeof conversations[0]): string => {
    if (!businessUsername) {
      return conversation.participants[1]?.username || conversation.participants[0]?.username || 'Unknown User';
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.username !== businessUsername
    );
    return otherParticipant?.username || 'Unknown User';
  };

  // Get selected conversation data for mobile header
  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.conversation_id === selectedConversationId)
    : null;
  const selectedParticipantName = selectedConversation 
    ? getParticipantName(selectedConversation)
    : 'Instagram Chats';

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
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: 'background.default' }}>
      {/* Left Panel - Conversation List (Hidden on mobile when conversation selected) */}
      <Box
        sx={{
          display: { xs: selectedConversationId ? 'none' : 'flex', sm: 'flex' },
          position: 'relative',
          width: { xs: '100%', sm: '320px', md: '320px' },
          maxWidth: { xs: '100%', sm: '320px', md: '320px' },
          flexShrink: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          flexDirection: 'column',
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', backgroundColor: theme.palette.background.paper }}>
          <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: { xs: 0.75, sm: 1 }, py: 0.75, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0 }}>
              Instagram Chats
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
                // Ensure unique key - use index as fallback if conversation_id is missing/duplicate
                const uniqueKey = conversation.conversation_id || `conv-${index}-${conversation.updated_time}`;
                
                // Find related order
                const buyerId = conversation.buyer_id || conversation.participants.find(p => p.username !== businessUsername)?.id;
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
                      minWidth: 0,
                      ...(!(isSelected) && {
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                      }),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, minWidth: 0 }}>
                      <AccountCircleIcon sx={{ width: 40, height: 40, color: 'text.secondary', flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              minWidth: 0,
                              flex: 1,
                            }}
                          >
                            {participantName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              flexShrink: 0, 
                              color: 'text.secondary',
                              whiteSpace: 'nowrap',
                            }}
                          >
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
                          <Box sx={{ mt: 0.25, display: 'flex', alignItems: 'center', gap: 0.25, flexWrap: 'wrap', minWidth: 0 }}>
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
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontWeight: 500, 
                                color: 'success.main',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minWidth: 0,
                              }}
                            >
                              {relatedOrder.order_number}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0 }}>
                              •
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minWidth: 0,
                              }}
                            >
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

      {/* Right Panel - Page Content (Flexible, Fixed) */}
      <Box
        sx={{
          display: 'flex',
          minWidth: 0,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          backgroundColor: 'background.default',
          position: 'relative',
          height: '100%',
          maxHeight: '100%',
          flexDirection: 'column',
        }}
      >
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
              px: 0.75,
              py: 0.75,
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
        <Box
          sx={{
            width: '100%',
            height: '100%',
            paddingTop: selectedConversationId ? { xs: '3rem', md: 0 } : 0,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              maxHeight: '100%',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
