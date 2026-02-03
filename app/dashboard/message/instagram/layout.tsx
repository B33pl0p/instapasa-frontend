'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/dashboard/lib/hooks';
import { fetchConversations, refreshAllCachedMessages, fetchPendingAttentionConversations } from '@/app/dashboard/lib/slices/instagramMessagesSlice';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, Typography, Badge, Chip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useToast } from '@/app/dashboard/lib/components/ToastContainer';

export default function InstagramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get('conversation') || undefined;
  const theme = useTheme();
  const { showToast } = useToast();
  const previousNeedsAttentionCount = useRef(0);

  const dispatch = useAppDispatch();
  const { conversations, businessUsername, conversationLoading, error, conversationsLoaded, messageCache } = useAppSelector(
    (state) => state.instagramMessages
  );
  const orders = useAppSelector((state) => state.orders.orders);

  // Count conversations needing attention
  const needsAttentionCount = conversations.filter(c => c.needs_human_attention).length;

  // LAZY LOADING: Only fetch conversations list on mount (lightweight overview)
  useEffect(() => {
    // Only fetch if not already loaded
    if (!conversationsLoaded && !conversationLoading) {
      dispatch(fetchConversations(false));
    }
  }, [dispatch, conversationsLoaded, conversationLoading]);

  // Poll for pending attention conversations every 5 seconds (only when page is visible)
  useEffect(() => {
    // Initial fetch
    if (conversationsLoaded) {
      dispatch(fetchPendingAttentionConversations());
    }

    // Check if page is visible
    const isPageVisible = () => !document.hidden;

    // Polling function
    const pollPendingConversations = () => {
      if (conversationsLoaded && isPageVisible()) {
        dispatch(fetchPendingAttentionConversations());
      }
    };

    // Set up polling interval (5 seconds)
    const pollInterval = setInterval(pollPendingConversations, 5000);

    // Handle visibility change - poll immediately when page becomes visible
    const handleVisibilityChange = () => {
      if (isPageVisible() && conversationsLoaded) {
        dispatch(fetchPendingAttentionConversations());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, conversationsLoaded]);

  // Show notification when new conversations need attention
  useEffect(() => {
    if (conversationsLoaded && needsAttentionCount > previousNeedsAttentionCount.current) {
      const newCount = needsAttentionCount - previousNeedsAttentionCount.current;
      showToast(
        `${newCount} conversation${newCount > 1 ? 's' : ''} need${newCount === 1 ? 's' : ''} your attention!`,
        'warning'
      );
      
      // Browser notification (if permission granted)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Customer Needs Attention', {
          body: `${newCount} conversation${newCount > 1 ? 's' : ''} require human response`,
          icon: '/favicon.ico',
          tag: 'conversation-attention',
          requireInteraction: false,
        });
      }
    }
    previousNeedsAttentionCount.current = needsAttentionCount;
  }, [needsAttentionCount, conversationsLoaded, showToast]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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

  // Sort conversations: needs_human_attention first, then by updated_time
  const sortedConversations = [...conversations].sort((a, b) => {
    // Prioritize conversations needing attention
    if (a.needs_human_attention && !b.needs_human_attention) return -1;
    if (!a.needs_human_attention && b.needs_human_attention) return 1;
    
    // Then sort by updated time (most recent first)
    return new Date(b.updated_time).getTime() - new Date(a.updated_time).getTime();
  });

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: 'background.default' }}>
      {/* Left Panel - Conversation List (Hidden on mobile when conversation selected) */}
      <Box
        sx={{
          display: { xs: selectedConversationId ? 'none' : 'flex', sm: 'flex' },
          position: 'relative',
          width: { xs: '100%', sm: '360px', md: '360px' },
          maxWidth: { xs: '100%', sm: '360px', md: '360px' },
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', bgcolor: 'background.paper' }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            px: 2.5, 
            py: 2, 
            flexShrink: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                Instagram Chats
              </Typography>
              {needsAttentionCount > 0 && (
                <Chip 
                  label={needsAttentionCount} 
                  color="error" 
                  size="small"
                  sx={{ height: 20, fontSize: '0.75rem', fontWeight: 'bold' }}
                />
              )}
            </Box>
            <Tooltip title="Refresh conversations">
              <IconButton
                size="medium"
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
                {typeof error === 'string' ? error : error?.msg || 'An error occurred'}
              </Typography>
            </Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', p: 2 }}>
              <Typography variant="caption" color="textSecondary" align="center">
                No conversations yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, p: 1.5 }}>
              {sortedConversations.map((conversation, index) => {
                const participantName = getParticipantName(conversation);
                const isSelected = selectedConversationId === conversation.conversation_id;
                // Ensure unique key - include updated_time to force re-render when conversation updates
                const uniqueKey = `${conversation.conversation_id}-${conversation.updated_time}`;
                
                // Find related order
                const buyerId = conversation.buyer_id || conversation.participants.find(p => p.username !== businessUsername)?.id;
                const relatedOrder = buyerId ? orders.find(order => order.buyer_id === buyerId) : null;

                return (
                  <Box
                    key={uniqueKey}
                    onClick={() => handleSelectConversation(conversation.conversation_id)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      p: 1.5,
                      mb: 1,
                      transition: 'all 0.2s ease',
                      bgcolor: isSelected ? 'action.selected' : 'transparent',
                      minWidth: 0,
                      '&:hover': { 
                        bgcolor: isSelected ? 'action.selected' : 'action.hover',
                        boxShadow: 1,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, minWidth: 0 }}>
                      <Box sx={{ position: 'relative' }}>
                        <AccountCircleIcon sx={{ width: 48, height: 48, color: 'text.secondary', flexShrink: 0 }} />
                        {conversation.needs_human_attention && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: 'error.main',
                              border: '2px solid',
                              borderColor: 'background.paper',
                              boxShadow: 1,
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
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
                              fontSize: '0.8rem',
                            }}
                          >
                            {formatTime(conversation.updated_time)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.5,
                            color: 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            fontSize: '0.9rem',
                          }}
                        >
                          {conversation.last_message?.text || 'No messages'}
                        </Typography>
                        {relatedOrder && (
                          <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minWidth: 0 }}>
                            <Box
                              component="svg"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              sx={{ width: '0.85rem', height: '0.85rem', color: 'success.main', flexShrink: 0 }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600, 
                                color: 'success.main',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minWidth: 0,
                                fontSize: '0.85rem',
                              }}
                            >
                              {relatedOrder.order_number}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.disabled', flexShrink: 0 }}>
                              •
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minWidth: 0,
                                fontSize: '0.85rem',
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
