'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useAppDispatch, useAppSelector } from '@/app/dashboard/lib/hooks';
import { fetchMessages, setCurrentConversation, sendQRCode, pauseAI } from '@/app/dashboard/lib/slices/instagramMessagesSlice';
import { fetchOrders } from '@/app/dashboard/lib/slices/orderSlice';
import { fetchBusinessConfig } from '@/app/dashboard/lib/slices/businessConfigSlice';
import apiClient from '@/app/dashboard/lib/apiClient';
import MessageBox from '@/app/dashboard/message/components/MessageBox';
import { useToast } from '@/app/dashboard/lib/components/ToastContainer';
import { useState } from 'react';
import ConversationHeader from './ConversationHeader';
import QRCodeModal from './QRCodeModal';

interface ConversationViewProps {
  conversationId: string | null;
}

export default function ConversationView({ conversationId }: ConversationViewProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useToast();
  const { messages, businessUsername, messageLoading, loadingOlderMessages, error, messageCache, conversations, hasMore } = useAppSelector(
    (state) => state.instagramMessages
  );
  const orders = useAppSelector((state) => state.orders.orders);
  const businessConfig = useAppSelector((state) => state.businessConfig);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{ url: string; type: string; file: File } | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Find all orders related to this conversation
  const relatedOrders = useMemo(() => {
    console.log('🔍 Finding orders for conversation:', conversationId);
    console.log('📦 Total orders available:', orders.length);
    console.log('💬 Total conversations:', conversations.length);
    
    if (!conversationId || !conversations || conversations.length === 0) {
      console.log('No conversation ID or conversations array empty');
      return [];
    }
    
    const conversation = conversations.find(c => c.conversation_id === conversationId);
    if (!conversation) {
      console.log('Conversation not found in array');
      return [];
    }
    
    console.log('Found conversation:', conversation);
    
    // Try to get buyer_id from multiple sources
    let buyerId = conversation.buyer_id;
    console.log('buyer_id from conversation:', buyerId);
    
    // Fallback: find participant that's not the business
    if (!buyerId && conversation.participants && conversation.participants.length > 0) {
      const buyerParticipant = conversation.participants.find(p => p.username !== businessUsername);
      buyerId = buyerParticipant?.id;
      console.log('buyer_id from participants:', buyerId);
    }
    
    if (!buyerId) {
      console.log('No buyer_id found');
      return [];
    }
    
    // Find ALL orders by buyer_id
    const foundOrders = orders.filter(order => {
      const match = order.buyer_id === buyerId || order.instagram_user_id === buyerId;
      if (match) {
        console.log('Order matched:', order.order_number);
      }
      return match;
    });
    
    console.log('Total orders found:', foundOrders.length);
    return foundOrders;
  }, [conversationId, conversations, orders, businessUsername]);

  // Fetch orders on mount to ensure we have order data
  useEffect(() => {
    if (orders.length === 0) {
      dispatch(fetchOrders());
    }
  }, [dispatch, orders.length]);

  // Fetch business config on mount to get QR codes
  useEffect(() => {
    if (businessConfig.payment_qr_codes.length === 0) {
      dispatch(fetchBusinessConfig());
    }
  }, [dispatch, businessConfig.payment_qr_codes.length]);

  useEffect(() => {
    dispatch(setCurrentConversation(conversationId));
    
    if (conversationId) {
      // Check if messages are already cached
      const isCached = !!messageCache[conversationId];
      console.log('🔄 Loading conversation:', conversationId, isCached ? '(cached)' : '(fetching from backend)');
      
      // Only force refresh if not cached, otherwise use cached messages
      dispatch(fetchMessages({ conversationId, forceRefresh: !isCached }));
    }
  }, [conversationId, dispatch]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Determine attachment type
    let attachmentType: 'image' | 'video' | 'audio' | 'file' = 'file';
    if (file.type.startsWith('image/')) attachmentType = 'image';
    else if (file.type.startsWith('video/')) attachmentType = 'video';
    else if (file.type.startsWith('audio/')) attachmentType = 'audio';

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setAttachmentPreview({ url: previewUrl, type: attachmentType, file });
  };

  const handleSendAttachment = async () => {
    if (!attachmentPreview || !conversationId || isSending) return;

    // Find the conversation to get buyer info
    const conversation = conversations.find(c => c.conversation_id === conversationId);
    if (!conversation) {
      showToast('Conversation not found', 'error');
      return;
    }

    // Get recipient_user_id (buyer_id)
    let recipientUserId = conversation.buyer_id;
    if (!recipientUserId && conversation.participants && conversation.participants.length > 0) {
      const buyerParticipant = conversation.participants.find(p => p.username !== businessUsername);
      recipientUserId = buyerParticipant?.id;
    }

    if (!recipientUserId) {
      showToast('Recipient user ID not found', 'error');
      return;
    }

    setIsUploadingAttachment(true);
    setIsSending(true);

    try {
      // 1. Get presigned URL
      const filename = attachmentPreview.file.name;
      const contentType = attachmentPreview.file.type;
      const uploadResponse = await apiClient.post<{ presigned_url: string; image_url: string }>(
        `/dashboard/upload-attachment?filename=${encodeURIComponent(filename)}&content_type=${encodeURIComponent(contentType)}`
      );

      const { presigned_url, image_url } = uploadResponse.data;

      // 2. Upload file to S3
      await fetch(presigned_url, {
        method: 'PUT',
        body: attachmentPreview.file,
        headers: { 'Content-Type': contentType }
      });

      // 3. Send message with attachment
      await apiClient.post('/dashboard/reply', {
        conversation_id: conversationId,
        message: messageInput.trim() || '',
        recipient_user_id: recipientUserId,
        platform: 'instagram',
        attachment_url: image_url,
        attachment_type: attachmentPreview.type
      });

      // Auto-pause AI when seller sends a manual message
      if (!conversation.ai_paused) {
        try {
          await dispatch(pauseAI(conversationId)).unwrap();
          showToast('AI paused - Manual reply sent', 'info');
        } catch (error) {
          console.error('Failed to pause AI:', error);
          // Don't fail the message send if pause fails
        }
      }

      // Clear input and preview
      setMessageInput('');
      setAttachmentPreview(null);
      URL.revokeObjectURL(attachmentPreview.url);

      // Refresh messages
      setTimeout(() => {
        dispatch(fetchMessages({ conversationId, forceRefresh: true }));
      }, 1000);
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      console.error('Failed to send attachment:', error);
      showToast(axiosError.response?.data?.detail || 'Failed to send attachment. Please try again.', 'error');
    } finally {
      setIsUploadingAttachment(false);
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    // If there's an attachment, send it instead
    if (attachmentPreview) {
      await handleSendAttachment();
      return;
    }

    if (!messageInput.trim() || !conversationId || isSending) return;

    // Find the conversation to get buyer info
    const conversation = conversations.find(c => c.conversation_id === conversationId);
    if (!conversation) {
      showToast('Conversation not found', 'error');
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
      showToast('Recipient user ID not found', 'error');
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

      // Auto-pause AI when seller sends a manual message
      if (!conversation.ai_paused) {
        try {
          await dispatch(pauseAI(conversationId)).unwrap();
          showToast('AI paused - Manual reply sent', 'info');
        } catch (error) {
          console.error('Failed to pause AI:', error);
          // Don't fail the message send if pause fails
        }
      }

      // Clear input
      setMessageInput('');

      // Refresh messages to show the new one
      setTimeout(() => {
        dispatch(fetchMessages({ conversationId, forceRefresh: true }));
      }, 1000);
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      console.error('Failed to send message:', error);
      showToast(axiosError.response?.data?.detail || 'Failed to send message. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleRefreshConversation = () => {
    if (conversationId) {
      dispatch(fetchMessages({ conversationId, forceRefresh: true, offset: 0 }));
    }
  };

  if (!conversationId) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.paper' }}>
        <Typography variant="body2" color="textSecondary">
          Select a conversation to view messages
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.paper', p: 2 }}>
        <Typography variant="body2" color="error" align="center">
          {typeof error === 'string' ? error : (error as any)?.msg || 'An error occurred'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        minHeight: 0,
        maxHeight: '100vh',
      }}
    >
      {/* Conversation Header with Customer Info & QR Button */}
      <ConversationHeader
        conversation={conversations.find(c => c.conversation_id === conversationId)}
        messages={messages}
        businessUsername={businessUsername}
        onSendQRClick={() => setQrModalOpen(true)}
        qrCodesAvailable={businessConfig.payment_qr_codes.length > 0}
        onRefresh={handleRefreshConversation}
        isRefreshing={messageLoading}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        qrCodes={businessConfig.payment_qr_codes}
        onSelectQR={async (qrUrl: string) => {
          const conversation = conversations.find(c => c.conversation_id === conversationId);
          if (!conversation) {
            showToast('Conversation not found', 'error');
            return;
          }

          let recipientUserId = conversation.buyer_id;
          if (!recipientUserId && conversation.participants && conversation.participants.length > 0) {
            const buyerParticipant = conversation.participants.find(p => p.username !== businessUsername);
            recipientUserId = buyerParticipant?.id;
          }

          if (!recipientUserId) {
            showToast('Recipient user ID not found', 'error');
            return;
          }

          if (!conversationId) {
            showToast('Conversation ID not found', 'error');
            return;
          }

          try {
            await dispatch(sendQRCode({ conversationId, qrCodeUrl: qrUrl, recipientUserId })).unwrap();
            showToast('QR code sent successfully!', 'success');
          } catch {
            showToast('Failed to send QR code. Please try again.', 'error');
          }
        }}
      />

      {/* Order Backlink Banner */}
      {relatedOrders.length > 0 && (
        <Paper sx={{ bgcolor: 'info.lighter', borderRadius: 0, boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
          {relatedOrders.length === 1 ? (
            <Stack direction="row" sx={{ px: 2, py: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <ShoppingBagIcon sx={{ color: 'info.main', width: 18, height: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.dark' }}>
                  {relatedOrders[0].order_number}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  • Rs. {relatedOrders[0].total.toFixed(2)}
                </Typography>
                <Chip
                  label={relatedOrders[0].status.replace('_', ' ')}
                  size="small"
                  variant="outlined"
                  color="info"
                />
              </Stack>
              <Button
                onClick={() => router.push('/dashboard/orders')}
                size="small"
                sx={{ textTransform: 'none' }}
                endIcon={<SendIcon sx={{ width: 16, height: 16 }} />}
              >
                View Order
              </Button>
            </Stack>
          ) : (
            <Box sx={{ px: 2, py: 1.5 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <ShoppingBagIcon sx={{ color: 'info.main', width: 18, height: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.dark' }}>
                    {relatedOrders.length} Orders
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    • Total: Rs. {relatedOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                  </Typography>
                </Stack>
                <Button
                  onClick={() => router.push('/dashboard/orders')}
                  size="small"
                  sx={{ textTransform: 'none' }}
                  endIcon={<SendIcon sx={{ width: 16, height: 16 }} />}
                >
                  View All Orders
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {relatedOrders.map((order) => (
                  <Chip
                    key={order.id}
                    label={`${order.order_number} • Rs. ${order.total.toFixed(0)}`}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>
      )}

      {/* Messages Area - Fixed height with scrollbar */}
      <Box 
        sx={{
          flex: '1 1 auto',
          overflow: 'hidden',
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%',
          width: '100%',
          minHeight: 0,
        }}
      >
        {/* Load More Button */}
        {hasMore && conversationId && !messageLoading && (
          <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Button
              variant="outlined"
              size="small"
              disabled={loadingOlderMessages}
              onClick={() => {
                const currentOffset = messageCache[conversationId]?.offset || 0;
                dispatch(fetchMessages({ conversationId, offset: currentOffset, forceRefresh: false }));
              }}
              startIcon={loadingOlderMessages ? <CircularProgress size={16} /> : null}
            >
              {loadingOlderMessages ? 'Loading...' : 'Load Older Messages'}
            </Button>
          </Box>
        )}
        
        <MessageBox 
          messages={messages} 
          businessUsername={businessUsername}
          loading={messageLoading}
        />
      </Box>

      {/* Message Input Area - Fixed at bottom */}
      <Paper 
        elevation={0}
        sx={{ 
          flexShrink: 0, 
          borderRadius: 0, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Attachment Preview */}
          {attachmentPreview && (
            <Paper 
              elevation={2}
              sx={{ 
                mb: 2, 
                p: 2, 
                bgcolor: 'background.paper', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                borderRadius: 2,
              }}
            >
              {attachmentPreview.type === 'image' && (
                <Box
                  component="img"
                  src={attachmentPreview.url}
                  alt="Preview"
                  sx={{ 
                    width: 72, 
                    height: 72, 
                    objectFit: 'cover', 
                    borderRadius: 1.5,
                    boxShadow: 1,
                  }}
                />
              )}
              {attachmentPreview.type === 'video' && (
                <Box
                  component="video"
                  src={attachmentPreview.url}
                  sx={{ 
                    width: 72, 
                    height: 72, 
                    objectFit: 'cover', 
                    borderRadius: 1.5,
                    boxShadow: 1,
                  }}
                />
              )}
              {(attachmentPreview.type === 'audio' || attachmentPreview.type === 'file') && (
                <Box sx={{ 
                  width: 72, 
                  height: 72, 
                  bgcolor: 'action.hover', 
                  borderRadius: 1.5, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: 1,
                }}>
                  <Typography sx={{ fontSize: '2rem' }}>
                    {attachmentPreview.type === 'audio' ? '🎵' : '📄'}
                  </Typography>
                </Box>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                  }}
                >
                  {attachmentPreview.file.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {(attachmentPreview.file.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
              <IconButton
                size="medium"
                color="error"
                onClick={() => {
                  URL.revokeObjectURL(attachmentPreview.url);
                  setAttachmentPreview(null);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Paper>
          )}

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={attachmentPreview ? "Add a caption (optional)" : "message..."}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1rem',
                },
                '& .MuiInputBase-input': {
                  py: 1.5,
                },
              }}
            />
            <input
              type="file"
              id="attachment-input"
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              style={{ display: 'none' }}
            />
            <label htmlFor="attachment-input" style={{ cursor: 'pointer' }}>
              <IconButton 
                component="span" 
                size="medium" 
                color="default"
                sx={{ 
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <AttachFileIcon />
              </IconButton>
            </label>
            <IconButton
              size="medium"
              color="default"
              title="Emoji"
              sx={{ 
                borderRadius: 2,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <EmojiEmotionsIcon />
            </IconButton>
            <Button
              onClick={handleSendMessage}
              disabled={(!messageInput.trim() && !attachmentPreview) || isSending}
              variant="contained"
              color="primary"
              size="large"
              endIcon={isUploadingAttachment ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                boxShadow: 2,
              }}
            >
              {isSending ? 'Sending' : 'Send'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
