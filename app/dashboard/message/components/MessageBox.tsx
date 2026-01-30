'use client';

import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, Avatar, Paper, Stack } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachFileIcon from '@mui/icons-material/AttachFile';

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
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100%', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            Loading messages...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (messages.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100%', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 400, textAlign: 'center', px: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'action.hover',
              color: 'text.secondary',
            }}
          >
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            No messages yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start a conversation to see messages here
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        bgcolor: 'background.default',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          justifyContent: 'flex-end',
          px: 2,
          py: 3,
        }}
      >
        <Stack spacing={2.5}>
          {messages.map((message, index) => {
            const isFromBusiness = isMessageFromBusiness(message);
            const messageText = message.text?.trim() || '';
            const uniqueKey = message.id 
              ? `${message.id}-${message.created_time}` 
              : `msg-${index}-${message.created_time}`;
            
            return (
              <Box
                key={uniqueKey}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 1.5,
                  justifyContent: isFromBusiness ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Avatar - Customer side */}
                {!isFromBusiness && (
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      flexShrink: 0,
                      boxShadow: 1,
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                )}

                {/* Message Content */}
                <Stack
                  spacing={0.5}
                  sx={{
                    maxWidth: '70%',
                    minWidth: 0,
                    alignItems: isFromBusiness ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: isFromBusiness ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      px: 2.5,
                      py: 1.5,
                      bgcolor: isFromBusiness ? 'primary.main' : 'background.paper',
                      color: isFromBusiness ? 'primary.contrastText' : 'text.primary',
                      border: isFromBusiness ? 'none' : 1,
                      borderColor: 'divider',
                      boxShadow: isFromBusiness ? 2 : 1,
                      wordBreak: 'break-word',
                    }}
                  >
                    {/* Postback (Button Click) */}
                    {message.postback && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                          pb: 1,
                          borderBottom: 1,
                          borderColor: isFromBusiness ? 'rgba(255,255,255,0.2)' : 'divider',
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.9 }}>
                          Clicked: {message.postback.title}
                        </Typography>
                      </Box>
                    )}

                    {/* Sticker */}
                    {message.sticker && (
                      <Box sx={{ mb: 1 }}>
                        <img 
                          src={message.sticker} 
                          alt="Sticker" 
                          style={{ maxWidth: '140px', maxHeight: '140px', objectFit: 'contain', borderRadius: '8px' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </Box>
                    )}

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <Stack spacing={1} sx={{ mb: messageText ? 1 : 0 }}>
                        {message.attachments.map((attachment, idx) => {
                          if (attachment.type === 'image') {
                            return (
                              <Box 
                                key={idx} 
                                sx={{ 
                                  borderRadius: 2, 
                                  overflow: 'hidden',
                                  boxShadow: 1,
                                }}
                              >
                                <img 
                                  src={attachment.url} 
                                  alt="Attachment" 
                                  style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '350px', 
                                    objectFit: 'contain', 
                                    display: 'block',
                                    borderRadius: '8px',
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              </Box>
                            );
                          } else if (attachment.type === 'video') {
                            return (
                              <Box key={idx} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <video 
                                  src={attachment.url} 
                                  controls 
                                  style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '8px', display: 'block' }}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </Box>
                            );
                          } else if (attachment.type === 'audio') {
                            return (
                              <Box key={idx} sx={{ borderRadius: 2 }}>
                                <audio src={attachment.url} controls style={{ width: '100%' }}>
                                  Your browser does not support the audio tag.
                                </audio>
                              </Box>
                            );
                          } else {
                            return (
                              <Box
                                key={idx}
                                component="a"
                                href={attachment.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: isFromBusiness ? 'rgba(255,255,255,0.15)' : 'action.hover',
                                  textDecoration: 'none',
                                  color: 'inherit',
                                  '&:hover': {
                                    bgcolor: isFromBusiness ? 'rgba(255,255,255,0.25)' : 'action.selected',
                                  },
                                  transition: 'background-color 0.2s',
                                }}
                              >
                                <AttachFileIcon sx={{ fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {attachment.type} file
                                </Typography>
                              </Box>
                            );
                          }
                        })}
                      </Stack>
                    )}

                    {/* Text Message */}
                    {messageText ? (
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: 1.6,
                          fontSize: '1rem',
                        }}
                      >
                        {messageText}
                      </Typography>
                    ) : !message.attachments && !message.sticker ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: 'italic',
                          opacity: 0.7,
                        }}
                      >
                        Empty message
                      </Typography>
                    ) : null}
                  </Paper>

                  {/* Timestamp */}
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1,
                      color: 'text.secondary',
                      fontSize: '0.8rem',
                    }}
                  >
                    {formatMessageTime(message.created_time)}
                  </Typography>
                </Stack>

                {/* Avatar - Business side */}
                {isFromBusiness && (
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: 'secondary.main',
                      color: 'secondary.contrastText',
                      flexShrink: 0,
                      boxShadow: 1,
                    }}
                  >
                    <StorefrontIcon />
                  </Avatar>
                )}
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>
    </Box>
  );
}
