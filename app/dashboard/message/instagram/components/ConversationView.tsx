'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/dashboard/lib/hooks';
import { fetchMessages, setCurrentConversation } from '@/app/dashboard/lib/slices/instagramMessagesSlice';
import MessageBox from '@/app/dashboard/message/components/MessageBox';
import MicIcon from '@mui/icons-material/Mic';
import ImageIcon from '@mui/icons-material/Image';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useState } from 'react';

interface ConversationViewProps {
  conversationId: string | null;
}

export default function ConversationView({ conversationId }: ConversationViewProps) {
  const dispatch = useAppDispatch();
  const { messages, businessUsername, messageLoading, error, currentConversationId, messageCache } = useAppSelector(
    (state) => state.instagramMessages
  );
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    dispatch(setCurrentConversation(conversationId));
    
    if (conversationId) {
      // LAZY LOADING: Only fetch if not already cached
      if (!messageCache[conversationId]) {
        // Fetch from API (lazy loading on demand)
        dispatch(fetchMessages({ conversationId, forceRefresh: false }));
      }
    }
  }, [conversationId, dispatch, messageCache]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // TODO: Implement send message API call
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <p className="text-center text-sm text-gray-500">
          Select a conversation to view messages
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-white p-4">
        <p className="text-center text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div 
      className="flex h-full w-full flex-col bg-white" 
      style={{ 
        minHeight: 0, 
        height: '100%', 
        maxHeight: '100vh', 
        display: 'flex',
      }}
    >
      {/* Messages Area - Fixed height with scrollbar */}
      <div 
        className="flex-1 overflow-hidden bg-gray-50" 
        style={{ 
          minHeight: 0,
          flex: '1 1 auto',
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          height: '100%',
          width: '100%',
        }}
      >
        <MessageBox 
          messages={messages} 
          businessUsername={businessUsername}
          loading={messageLoading}
        />
      </div>

      {/* Message Input Area - Fixed at bottom */}
      <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            placeholder="Message ..."
            className="flex-1 rounded-lg border border-gray-300 px-3 sm:px-4 py-2 text-sm focus:border-[#8A38F5] focus:outline-none focus:ring-2 focus:ring-[#8A38F5] focus:ring-opacity-20"
          />
          <button
            type="button"
            className="rounded-lg p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Microphone"
          >
            <MicIcon sx={{ width: 18, height: 18, '@media (min-width: 640px)': { width: 20, height: 20 } }} />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Image"
          >
            <ImageIcon sx={{ width: 18, height: 18, '@media (min-width: 640px)': { width: 20, height: 20 } }} />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Emoji"
          >
            <EmojiEmotionsIcon sx={{ width: 18, height: 18, '@media (min-width: 640px)': { width: 20, height: 20 } }} />
          </button>
        </div>
      </div>
    </div>
  );
}
