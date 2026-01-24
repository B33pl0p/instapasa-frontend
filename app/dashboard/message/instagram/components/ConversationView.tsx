'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/dashboard/lib/hooks';
import { fetchMessages, setCurrentConversation } from '@/app/dashboard/lib/slices/instagramMessagesSlice';
import { fetchOrders } from '@/app/dashboard/lib/slices/orderSlice';
import apiClient from '@/app/dashboard/lib/apiClient';
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
  const router = useRouter();
  const { messages, businessUsername, messageLoading, error, currentConversationId, messageCache, conversations } = useAppSelector(
    (state) => state.instagramMessages
  );
  const orders = useAppSelector((state) => state.orders.orders);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Find all orders related to this conversation
  const relatedOrders = useMemo(() => {
    console.log('🔍 Finding orders for conversation:', conversationId);
    console.log('📦 Total orders available:', orders.length);
    console.log('💬 Total conversations:', conversations.length);
    
    if (!conversationId || !conversations || conversations.length === 0) {
      console.log('❌ No conversation ID or conversations array empty');
      return [];
    }
    
    const conversation = conversations.find(c => c.conversation_id === conversationId);
    if (!conversation) {
      console.log('❌ Conversation not found in array');
      return [];
    }
    
    console.log('✅ Found conversation:', conversation);
    
    // Try to get buyer_id from multiple sources
    let buyerId = conversation.buyer_id;
    console.log('👤 buyer_id from conversation:', buyerId);
    
    // Fallback: find participant that's not the business
    if (!buyerId && conversation.participants && conversation.participants.length > 0) {
      const buyerParticipant = conversation.participants.find(p => p.username !== businessUsername);
      buyerId = buyerParticipant?.id;
      console.log('👤 buyer_id from participants:', buyerId);
    }
    
    if (!buyerId) {
      console.log('❌ No buyer_id found');
      return [];
    }
    
    // Find ALL orders by buyer_id
    const foundOrders = orders.filter(order => {
      const match = order.buyer_id === buyerId || order.instagram_user_id === buyerId;
      if (match) {
        console.log('✅ Order matched:', order.order_number);
      }
      return match;
    });
    
    console.log('🎯 Total orders found:', foundOrders.length);
    return foundOrders;
  }, [conversationId, conversations, orders, businessUsername]);

  // Fetch orders on mount to ensure we have order data
  useEffect(() => {
    if (orders.length === 0) {
      dispatch(fetchOrders());
    }
  }, [dispatch, orders.length]);

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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversationId || isSending) return;

    // Find the conversation to get buyer info
    const conversation = conversations.find(c => c.conversation_id === conversationId);
    if (!conversation) {
      alert('Conversation not found');
      return;
    }

    // Get recipient_user_id (buyer_id)
    let recipientUserId = conversation.buyer_id;
    
    // Fallback: find participant that's not the business
    if (!recipientUserId && conversation.participants && conversation.participants.length > 0) {
      const buyerParticipant = conversation.participants.find(p => p.username !== businessUsername);
      recipientUserId = buyerParticipant?.id;
    }

    if (!recipientUserId) {
      alert('Recipient user ID not found');
      return;
    }

    setIsSending(true);
    try {
      await apiClient.post('/dashboard/reply', {
        conversation_id: conversationId,
        message: messageInput.trim(),
        recipient_user_id: recipientUserId,
        platform: 'instagram'
      });

      // Clear input
      setMessageInput('');

      // Refresh messages to show the new one
      setTimeout(() => {
        dispatch(fetchMessages({ conversationId, forceRefresh: true }));
      }, 1000);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.detail || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
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
      {/* Order Backlink Banner */}
      {relatedOrders.length > 0 && (
        <div className="shrink-0 bg-blue-50 border-b border-blue-200">
          {relatedOrders.length === 1 ? (
            <div className="px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-blue-900 font-medium">{relatedOrders[0].order_number}</span>
                <span className="text-blue-700">• Rs. {relatedOrders[0].total.toFixed(2)}</span>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">{relatedOrders[0].status.replace('_', ' ')}</span>
              </div>
              <button
                onClick={() => router.push('/dashboard/orders')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                View Order
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="text-blue-900 font-medium">{relatedOrders.length} Orders</span>
                  <span className="text-blue-700">• Total: Rs. {relatedOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</span>
                </div>
                <button
                  onClick={() => router.push('/dashboard/orders')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  View All Orders
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {relatedOrders.map((order) => (
                  <div key={order.id} className="text-xs bg-white border border-blue-200 rounded px-2 py-1 flex items-center gap-2">
                    <span className="font-medium text-blue-900">{order.order_number}</span>
                    <span className="text-gray-500">Rs. {order.total.toFixed(0)}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{order.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
      <div className="shrink-0 border-t border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Microphone"
          >
            <MicIcon sx={{ width: 20, height: 20 }} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Image"
          >
            <ImageIcon sx={{ width: 20, height: 20 }} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Emoji"
          >
            <EmojiEmotionsIcon sx={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
