'use client';

import React, { useEffect, useRef } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface Postback {
  title: string;
  payload: string;
}

interface Attachment {
  type: string;
  url: string;
  media?: any;
}

interface Message {
  id: string;
  created_time: string;
  text: string | null;
  from?: { username?: string; id: string };
  to?: { username?: string; id: string }[];
  is_from_business?: boolean;
  postback?: Postback | null;
  attachments?: Attachment[] | null;
  sticker?: string | null;
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
                  {/* Postback (Button Click) */}
                  {message.postback && (
                    <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${
                      isFromBusiness ? 'border-white/20' : 'border-gray-200'
                    }`}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
                      </svg>
                      <span className="text-xs opacity-80 font-medium">
                        Clicked: {message.postback.title}
                      </span>
                    </div>
                  )}

                  {/* Sticker */}
                  {message.sticker && (
                    <div className="mb-2">
                      <img 
                        src={message.sticker} 
                        alt="Sticker" 
                        className="max-w-[120px] max-h-[120px] object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Attachments (Images, Videos, Files) */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {message.attachments.map((attachment, idx) => {
                        if (attachment.type === 'image') {
                          return (
                            <div key={idx} className="rounded overflow-hidden">
                              <img 
                                src={attachment.url} 
                                alt="Attachment" 
                                className="max-w-full max-h-[300px] object-contain rounded"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                          );
                        } else if (attachment.type === 'video') {
                          return (
                            <div key={idx} className="rounded overflow-hidden">
                              <video 
                                src={attachment.url} 
                                controls 
                                className="max-w-full max-h-[300px] rounded"
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          );
                        } else if (attachment.type === 'audio') {
                          return (
                            <div key={idx} className="rounded">
                              <audio src={attachment.url} controls className="w-full">
                                Your browser does not support the audio tag.
                              </audio>
                            </div>
                          );
                        } else {
                          return (
                            <a 
                              key={idx}
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 p-2 rounded ${
                                isFromBusiness ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm">📎 {attachment.type} file</span>
                            </a>
                          );
                        }
                      })}
                    </div>
                  )}

                  {/* Text Message */}
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
