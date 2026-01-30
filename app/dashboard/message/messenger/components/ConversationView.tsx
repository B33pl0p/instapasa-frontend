'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from '@/app/dashboard/lib/hooks';
import { fetchMessengerMessages, setCurrentConversation } from '@/app/dashboard/lib/slices/messengerMessagesSlice';
import { fetchOrders } from '@/app/dashboard/lib/slices/orderSlice';
import apiClient from '@/app/dashboard/lib/apiClient';
import MessageBox from '@/app/dashboard/message/components/MessageBox';
import { useToast } from '@/app/dashboard/lib/components/ToastContainer';
import { Box, Button, TextField, IconButton, CircularProgress, Paper, Stack, Typography, Chip, Divider } from '@mui/material';
import { Send as SendIcon, AttachFile as AttachFileIcon, Close as CloseIcon, ShoppingBag as ShoppingBagIcon } from '@mui/icons-material';
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
  const theme = useTheme();
  const { showToast } = useToast();  const { messages, messageLoading, error, currentConversationId, messageCache, conversations } = useAppSelector(
    (state) => state.messengerMessages
  );
  const orders = useAppSelector((state) => state.orders.orders);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{ url: string; type: string; file: File } | null>(null);

  // Find all orders related to this conversation
  const relatedOrders = useMemo(() => {
    if (!conversationId || !conversations || conversations.length === 0) return [];
    
    const conversation = conversations.find(c => c.conversation_id === conversationId);
    if (!conversation) return [];
    
    // Try to get buyer_id from multiple sources
    let buyerId = conversation.buyer_id;
    
    // Fallback: get first participant's id
    if (!buyerId && conversation.participants && conversation.participants.length > 0) {
      buyerId = conversation.participants[0]?.id;
    }
    
    if (!buyerId) return [];
    
    // Find ALL orders by buyer_id
    return orders.filter(order => order.buyer_id === buyerId || order.instagram_user_id === buyerId);
  }, [conversationId, conversations, orders]);

  // Fetch orders on mount to ensure we have order data
  useEffect(() => {
    if (orders.length === 0) {
      dispatch(fetchOrders());
    }
  }, [dispatch, orders.length]);

  useEffect(() => {
    dispatch(setCurrentConversation(conversationId));
    
    if (conversationId) {
      // Always fetch fresh messages when opening a conversation
      dispatch(fetchMessengerMessages({ conversationId, forceRefresh: true }));
    }
  }, [conversationId, dispatch]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let attachmentType: 'image' | 'video' | 'audio' | 'file' = 'file';
    if (file.type.startsWith('image/')) attachmentType = 'image';
    else if (file.type.startsWith('video/')) attachmentType = 'video';
    else if (file.type.startsWith('audio/')) attachmentType = 'audio';

    const previewUrl = URL.createObjectURL(file);
    setAttachmentPreview({ url: previewUrl, type: attachmentType, file });
  };

  const handleSendAttachment = async () => {
    if (!attachmentPreview || !conversationId || isSending) return;

    const conversation = conversations.find(c => c.conversation_id === conversationId);
    if (!conversation) {
      showToast('Conversation not found', 'error');
      return;
    }

    let recipientUserId = conversation.buyer_id;
    if (!recipientUserId && conversation.participants && conversation.participants.length > 0) {
      recipientUserId = conversation.participants[0]?.id;
    }

    if (!recipientUserId) {
      showToast('Recipient user ID not found', 'error');
      return;
    }

    setIsUploadingAttachment(true);
    setIsSending(true);

    try {
      const filename = attachmentPreview.file.name;
      const contentType = attachmentPreview.file.type;
      const uploadResponse = await apiClient.post<{ presigned_url: string; image_url: string }>(
        `/dashboard/upload-attachment?filename=${encodeURIComponent(filename)}&content_type=${encodeURIComponent(contentType)}`
      );

      const { presigned_url, image_url } = uploadResponse.data;

      await fetch(presigned_url, {
        method: 'PUT',
        body: attachmentPreview.file,
        headers: { 'Content-Type': contentType }
      });

      await apiClient.post('/dashboard/reply', {
        conversation_id: conversationId,
        message: messageInput.trim() || '',
        recipient_user_id: recipientUserId,
        platform: 'facebook',
        attachment_url: image_url,
        attachment_type: attachmentPreview.type
      });

      setMessageInput('');
      setAttachmentPreview(null);
      URL.revokeObjectURL(attachmentPreview.url);

      setTimeout(() => {
        dispatch(fetchMessengerMessages({ conversationId, forceRefresh: true }));
      }, 1000);
    } catch (error: any) {
      console.error('Failed to send attachment:', error);
      showToast(error.response?.data?.detail || 'Failed to send attachment. Please try again.', 'error');
    } finally {
      setIsUploadingAttachment(false);
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
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
    
    // Fallback: get first participant's id
    if (!recipientUserId && conversation.participants && conversation.participants.length > 0) {
      recipientUserId = conversation.participants[0]?.id;
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
        platform: 'facebook'
      });

      // Clear input
      setMessageInput('');

      // Refresh messages to show the new one
      setTimeout(() => {
        dispatch(fetchMessengerMessages({ conversationId, forceRefresh: true }));
      }, 1000);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      showToast(error.response?.data?.detail || 'Failed to send message. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (!conversationId) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.paper' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Select a conversation to view messages
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.paper', p: 2 }}>
        <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: 0 }}>
      {/* Order Backlink Banner */}
      {relatedOrders.length > 0 && (
        <Paper sx={{ bgcolor: 'info.lighter', borderRadius: 0, boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
          {relatedOrders.length === 1 ? (
            <Stack direction="row" sx={{ px: 2, py: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <ShoppingBagIcon sx={{ width: 16, height: 16, color: 'info.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.dark' }}>
                  {relatedOrders[0].order_number}
                </Typography>
                <Typography variant="body2" sx={{ color: 'info.dark' }}>
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
                size="small"
                onClick={() => router.push('/dashboard/orders')}
                endIcon={<SendIcon sx={{ width: 16, height: 16 }} />}
              >
                View Order
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1.5} sx={{ px: 2, py: 1.5 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <ShoppingBagIcon sx={{ width: 16, height: 16, color: 'info.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.dark' }}>
                    {relatedOrders.length} Orders
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'info.dark' }}>
                    • Total: Rs. {relatedOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  onClick={() => router.push('/dashboard/orders')}
                  endIcon={<SendIcon sx={{ width: 16, height: 16 }} />}
                >
                  View All Orders
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {relatedOrders.map((order) => (
                  <Chip
                    key={order.id}
                    label={
                      <Stack direction="row" spacing={0.5}>
                        <span>{order.order_number}</span>
                        <span>• Rs. {order.total.toFixed(0)}</span>
                        <span>{order.status.replace('_', ' ')}</span>
                      </Stack>
                    }
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                ))}
              </Stack>
            </Stack>
          )}
        </Paper>
      )}

      {/* Messages Area - Fixed height with scrollbar */}
      <Box sx={{ flex: '1 1 auto', overflow: 'hidden', backgroundColor: 'background.default', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <MessageBox 
          messages={messages} 
          businessUsername={null}
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
        {attachmentPreview && (
          <Paper 
            elevation={2}
            sx={{ 
              m: 2, 
              mb: 0,
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
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                }}
              >
                {attachmentPreview.file.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {(attachmentPreview.file.size / 1024).toFixed(1)} KB
              </Typography>
            </Stack>
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

        <Stack direction="row" spacing={1.5} sx={{ p: 3, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            variant="outlined"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={attachmentPreview ? "Add a caption (optional)" : "Type your message..."}
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
          <IconButton 
            component="label" 
            size="medium"
            sx={{ 
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <input
              type="file"
              hidden
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            />
            <AttachFileIcon />
          </IconButton>
          <IconButton 
            size="medium" 
            color="default"
            sx={{ 
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <EmojiEmotionsIcon />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSendMessage}
            disabled={(!messageInput.trim() && !attachmentPreview) || isSending}
            endIcon={isUploadingAttachment || isSending ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: 2,
            }}
          >
            Send
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
