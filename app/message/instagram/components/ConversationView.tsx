'use client';

import { useState, useEffect, useRef } from 'react';
import apiClient from '@/app/lib/apiClient';
import type { ConversationDetailResponse, Message } from '../types';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MicIcon from '@mui/icons-material/Mic';
import ImageIcon from '@mui/icons-material/Image';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

interface ConversationViewProps {
  conversationId: string | null;
}

export default function ConversationView({ conversationId }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [businessUsername, setBusinessUsername] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<ConversationDetailResponse>(
          `/dashboard/messages/${conversationId}?platform=instagram`
        );
        setMessages(response.data.messages || []);
        setBusinessUsername(response.data.instagram_username);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            setError('Conversation not found');
          } else if (axiosError.response?.status === 400) {
            setError('Instagram not connected');
          } else {
            setError('Failed to load messages');
          }
        } else {
          setError('Failed to load messages');
        }
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchMessages();
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatMessageTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-[#8A38F5] border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
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

  // Determine if message is from business
  // Primary: check if from username matches business username
  // Fallback: use is_from_business flag
  const isMessageFromBusiness = (message: Message): boolean => {
    // Primary check: compare username with business username
    if (businessUsername && message.from?.username) {
      return message.from.username === businessUsername;
    }
    // Fallback: use is_from_business flag
    if (message.is_from_business !== undefined) {
      return message.is_from_business;
    }
    // Default: assume false (user message) if we can't determine
    return false;
  };

  // Check if there are any messages from business
  const hasFromMessages = messages.some((message) => isMessageFromBusiness(message));

  return (
    <div className="flex h-full  w-full flex-col bg-white">
      {/* Messages Area - Scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 min-h-0"
      >
        <div className="space-y-4">
          {messages.map((message) => {
            const isFromBusiness = isMessageFromBusiness(message);

            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  isFromBusiness ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isFromBusiness && (
                  <AccountCircleIcon
                    sx={{
                      width: 32,
                      height: 32,
                      color: 'text.secondary',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div
                  className={`${hasFromMessages ? 'max-w-[70%]' : 'max-w-full'} rounded-lg px-4 py-2 ${
                    isFromBusiness
                      ? 'bg-[#8A38F5] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.text}</p>
                  <p
                    className={`mt-1 text-xs ${
                      isFromBusiness ? 'text-purple-100' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.created_time)}
                  </p>
                </div>
                {isFromBusiness && (
                  <AccountCircleIcon
                    sx={{
                      width: 32,
                      height: 32,
                      color: 'text.secondary',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input Area */}
      <div className="border-t border-gray-200 p-4">
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
            placeholder="Message ..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#8A38F5] focus:outline-none focus:ring-2 focus:ring-[#8A38F5] focus:ring-opacity-20"
          />
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Microphone"
          >
            <MicIcon sx={{ width: 20, height: 20 }} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Image"
          >
            <ImageIcon sx={{ width: 20, height: 20 }} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Emoji"
          >
            <EmojiEmotionsIcon sx={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
