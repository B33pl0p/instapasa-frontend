'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, Typography } from '@mui/material';
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
  const theme = useTheme();

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
      <div style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            marginBottom: '0.5rem',
            height: '2rem',
            width: '2rem',
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            border: `4px solid ${theme.palette.divider}`,
            borderTopColor: theme.palette.primary.main,
            margin: '0 auto 0.5rem',
          }}></div>
          <p style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>Loading messages...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
      }}>
        <div style={{ textAlign: 'center', maxWidth: '28rem', padding: '1rem' }}>
          <AccountCircleIcon
            sx={{
              width: 64,
              height: 64,
              color: 'text.secondary',
              margin: '0 auto 1rem',
              display: 'block',
            }}
          />
          <p style={{ fontSize: '1rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: '0.25rem' }}>
            No messages yet
          </p>
          <p style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
            Start a conversation to see messages here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: theme.palette.background.default,
        scrollBehavior: 'smooth',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        justifyContent: 'flex-end',
        paddingLeft: '0.75rem',
        paddingRight: '0.75rem',
        paddingTop: '0.75rem',
        paddingBottom: '0.75rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '0.5rem',
                  width: '100%',
                  justifyContent: isFromBusiness ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Avatar - only show for customer messages */}
                {!isFromBusiness && (
                  <div style={{ flexShrink: 0, marginBottom: '0.25rem' }}>
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
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '75%',
                  minWidth: 0,
                  alignItems: isFromBusiness ? 'flex-end' : 'flex-start',
                }}>
                  <div
                    style={{
                      borderRadius: '1rem',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      hyphens: 'auto',
                      backgroundColor: isFromBusiness ? theme.palette.primary.main : theme.palette.background.paper,
                      color: isFromBusiness ? theme.palette.primary.contrastText : theme.palette.text.primary,
                      border: isFromBusiness ? 'none' : `1px solid ${theme.palette.divider}`,
                    }}
                  >
                  {/* Postback (Button Click) */}
                  {message.postback && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      paddingBottom: '0.5rem',
                      borderBottom: `1px solid ${isFromBusiness ? 'rgba(255, 255, 255, 0.2)' : theme.palette.divider}`,
                    }}>
                      <svg style={{ width: '1rem', height: '1rem', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
                      </svg>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>
                        Clicked: {message.postback.title}
                      </span>
                    </div>
                  )}

                  {/* Sticker */}
                  {message.sticker && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <img 
                        src={message.sticker} 
                        alt="Sticker" 
                        style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Attachments (Images, Videos, Files) */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      {message.attachments.map((attachment, idx) => {
                        if (attachment.type === 'image') {
                          return (
                            <div key={idx} style={{ borderRadius: '0.375rem', overflow: 'hidden' }}>
                              <img 
                                src={attachment.url} 
                                alt="Attachment" 
                                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '0.375rem' }}
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                          );
                        } else if (attachment.type === 'video') {
                          return (
                            <div key={idx} style={{ borderRadius: '0.375rem', overflow: 'hidden' }}>
                              <video 
                                src={attachment.url} 
                                controls 
                                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '0.375rem' }}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          );
                        } else if (attachment.type === 'audio') {
                          return (
                            <div key={idx} style={{ borderRadius: '0.375rem' }}>
                              <audio src={attachment.url} controls style={{ width: '100%' }}>
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
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                backgroundColor: isFromBusiness ? 'rgba(255, 255, 255, 0.1)' : theme.palette.action.hover,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: 'inherit',
                              }}
                            >
                              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                              </svg>
                              <span style={{ fontSize: '0.875rem' }}>📎 {attachment.type} file</span>
                            </a>
                          );
                        }
                      })}
                    </div>
                  )}

                  {/* Text Message */}
                  {messageText ? (
                    <p style={{
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: 1.5,
                      margin: 0,
                    }}>
                      {messageText}
                    </p>
                  ) : (
                    <p style={{
                      fontSize: '0.875rem',
                      fontStyle: 'italic',
                      opacity: 0.7,
                      margin: 0,
                    }}>
                      Empty message
                    </p>
                  )}
                </div>
                <p
                  style={{
                    marginTop: '0.25rem',
                    paddingLeft: '0.25rem',
                    paddingRight: '0.25rem',
                    fontSize: '0.75rem',
                    color: isFromBusiness ? theme.palette.text.secondary : theme.palette.text.secondary,
                  }}
                >
                  {formatMessageTime(message.created_time)}
                </p>
                </div>

                {/* Avatar - only show for business messages */}
                {isFromBusiness && (
                  <div style={{ flexShrink: 0, marginBottom: '0.25rem' }}>
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
          <div ref={messagesEndRef} style={{ height: '0.25rem' }} />
        </div>
      </div>
    </div>
  );
}
