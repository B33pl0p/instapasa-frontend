'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/dashboard/lib/hooks';
import { fetchConversations } from '@/app/dashboard/lib/slices/instagramMessagesSlice';
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
  const [showMobileList, setShowMobileList] = useState(!selectedConversationId);

  const dispatch = useAppDispatch();
  const { conversations, businessUsername, loading, error, conversationsLoaded } = useAppSelector(
    (state) => state.instagramMessages
  );

  // On mobile, hide list when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      setShowMobileList(false);
    }
  }, [selectedConversationId]);

  // Lazy loading: Only fetch conversations list on mount (fast)
  useEffect(() => {
    // Only fetch if not already loaded
    if (!conversationsLoaded && !loading) {
      dispatch(fetchConversations());
    }
  }, [dispatch, conversationsLoaded, loading]);

  // Refresh conversations list (no sync, just refresh the list)
  const handleRefresh = async () => {
    try {
      await dispatch(fetchConversations()).unwrap();
    } catch (err) {
      // Error already handled in Redux
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('conversation', conversationId);
    router.push(`/dashboard/message/instagram?${params.toString()}`);
    // On mobile, hide list after selection
    if (window.innerWidth < 768) {
      setShowMobileList(false);
    }
  };

  const handleBackToList = () => {
    router.push('/dashboard/message/instagram');
    setShowMobileList(true);
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
    <div className="flex h-screen w-full overflow-hidden bg-white" style={{ position: 'relative', height: '100vh', maxHeight: '100vh' }}>
      {/* Left Panel - Conversation List (Desktop: Always visible, Mobile: Toggle) */}
      <div 
        className={`${
          showMobileList ? 'flex' : 'hidden'
        } md:flex absolute md:relative inset-0 md:inset-auto w-full sm:w-80 md:w-80 lg:w-80 z-10 md:z-auto shrink-0 border-r border-gray-200 bg-white flex-col`}
        style={{ 
          height: '100vh',
          maxHeight: '100vh',
        }}
      >
        <div className="flex h-full flex-col bg-white" style={{ height: '100%', maxHeight: '100vh' }}>
          <div className="border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 shrink-0 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Instagram Chats</h2>
            <Tooltip title="Refresh conversations">
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={loading}
                sx={{
                  color: loading ? 'text.disabled' : 'text.primary',
                }}
              >
                <RefreshIcon
                  sx={{
                    animation: loading ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          </div>
          
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-[#8A38F5] border-t-transparent"></div>
                <p className="text-sm text-gray-500">Loading conversations...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-center text-sm text-red-500">{error}</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-center text-sm text-gray-500">No conversations yet</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin' }}>
              {conversations.map((conversation, index) => {
                const participantName = getParticipantName(conversation);
                const isSelected = selectedConversationId === conversation.conversation_id;
                // Ensure unique key - use index as fallback if conversation_id is missing/duplicate
                const uniqueKey = conversation.conversation_id || `conv-${index}-${conversation.updated_time}`;

                return (
                  <div
                    key={uniqueKey}
                    onClick={() => handleSelectConversation(conversation.conversation_id)}
                    className={`cursor-pointer border-b border-gray-100 px-3 sm:px-4 py-2 sm:py-3 transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AccountCircleIcon
                        sx={{
                          width: 40,
                          height: 40,
                          color: 'text.secondary',
                          flexShrink: 0,
                        }}
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {participantName}
                          </p>
                          <span className="ml-2 shrink-0 text-xs text-gray-500">
                            {formatTime(conversation.updated_time)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {conversation.last_message?.text || 'No messages'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Page Content (Flexible, Fixed) */}
      <div 
        className={`flex min-w-0 flex-1 min-h-0 overflow-hidden bg-white relative ${
          showMobileList && selectedConversationId ? 'hidden md:flex' : 'flex'
        }`}
        style={{ 
          height: '100vh',
          maxHeight: '100vh',
        }}
      >
        {selectedConversationId && (
          <div className="md:hidden absolute top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-3 sm:px-4 py-2 flex items-center gap-2 h-12 sm:h-14">
            <IconButton size="small" onClick={handleBackToList}>
              <ArrowBackIcon />
            </IconButton>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Instagram Chats</h2>
          </div>
        )}
        <div 
          className={`w-full h-full ${selectedConversationId ? 'pt-12 md:pt-0' : ''}`}
          style={{ 
            height: '100%', 
            maxHeight: '100vh',
          }}
        >
          <div 
            className="w-full h-full"
            style={{
              height: '100%',
              maxHeight: '100vh',
            }}
          >
            {children}
          </div>
        </div>
      </div>


    </div>
  );
}
