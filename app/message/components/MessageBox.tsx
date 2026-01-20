'use client';

import React, { useEffect, useRef } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface Message {
  id: string;
  created_time: string;
  text: string;
  from?: { username?: string; id: string };
  to?: { username?: string; id: string }[];
  is_from_business?: boolean;
}

interface MessageBoxProps {
  messages: Message[];
  businessUsername: string | null;
  loading?: boolean;
}

export default function MessageBox({ messages, businessUsername, loading }: MessageBoxProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wasAtBottomRef = useRef(true);

  // Check if user is at bottom before scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const threshold = 100;
    wasAtBottomRef.current = 
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!containerRef.current || !messagesEndRef.current) return;

    // Always scroll to bottom on new messages if user was at bottom
    if (wasAtBottomRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatMessageTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isMessageFromBusiness = (message: Message): boolean => {
    if (businessUsername && message.from?.username) {
      return message.from.username === businessUsername;
    }
    return message.is_from_business ?? false;
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-[#8A38F5] border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm mx-auto px-4">
          <AccountCircleIcon
            sx={{
              width: 64,
              height: 64,
              color: 'text.secondary',
              margin: '0 auto 16px',
            }}
          />
          <p className="text-base font-medium text-gray-700 mb-1">No messages yet</p>
          <p className="text-sm text-gray-500">Start a conversation to see messages here</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-y-auto overflow-x-hidden bg-gray-50"
      style={{
        scrollBehavior: 'smooth',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
      }}
    >
      <div className="flex flex-col min-h-full justify-end px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {messages.map((message, index) => {
            const isFromBusiness = isMessageFromBusiness(message);
            const messageText = message.text?.trim() || '';
            // Ensure unique key - combine id with index and timestamp to prevent duplicates
            const uniqueKey = message.id 
              ? `${message.id}-${message.created_time}` 
              : `msg-${index}-${message.created_time}`;
            
            return (
              <div
                key={uniqueKey}
                className={`flex items-end gap-2 w-full ${isFromBusiness ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar - only show for customer messages */}
                {!isFromBusiness && (
                  <div className="shrink-0 mb-1">
                    <AccountCircleIcon
                      sx={{
                        width: 32,
                        height: 32,
                        color: 'text.secondary',
                      }}
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div className="flex flex-col max-w-[75%] min-w-0" style={{
                  alignItems: isFromBusiness ? 'flex-end' : 'flex-start',
                }}>
                <div
                  className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm break-words ${
                    isFromBusiness
                      ? 'bg-[#8A38F5] text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                  }}
                >
                  {messageText ? (
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {messageText}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm italic opacity-70">Empty message</p>
                  )}
                </div>
                <p
                  className={`mt-1 px-1 text-[10px] sm:text-xs ${
                    isFromBusiness ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                    {formatMessageTime(message.created_time)}
                  </p>
                </div>

                {/* Avatar - only show for business messages */}
                {isFromBusiness && (
                  <div className="shrink-0 mb-1">
                    <AccountCircleIcon
                      sx={{
                        width: 32,
                        height: 32,
                        color: 'text.secondary',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>
    </div>
  );
}
