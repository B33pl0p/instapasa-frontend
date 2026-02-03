import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../apiClient';
import type { Conversation, ConversationDetailResponse, Message } from '@/app/dashboard/message/instagram/types';

// Cache for storing fetched messages per conversation
interface MessageCache {
  [conversationId: string]: {
    messages: Message[];
    businessUsername: string | null;
    fetchedAt: number;
    hasMore: boolean;
    total: number;
    offset: number;
  };
}

interface InstagramMessagesState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  businessUsername: string | null;
  messageCache: MessageCache;
  loading: boolean;
  conversationLoading: boolean;
  messageLoading: boolean;
  loadingOlderMessages: boolean;
  syncing: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  conversationsLoaded: boolean;
  hasMore: boolean;
}

const initialState: InstagramMessagesState = {
  conversations: [],
  currentConversationId: null,
  messages: [],
  businessUsername: null,
  messageCache: {},
  loading: false,
  conversationLoading: false,
  messageLoading: false,
  loadingOlderMessages: false,
  syncing: false,
  error: null,
  lastSyncedAt: null,
  conversationsLoaded: false,
  hasMore: false,
};

// Async thunks
export const syncInstagramMessages = createAsyncThunk(
  'instagramMessages/sync',
  async (
    params: { limit?: number; messagesPerConversation?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { limit = 50, messagesPerConversation = 50 } = params;
      const response = await apiClient.post(
        `/dashboard/sync?platform=instagram&limit=${limit}&messages_per_conversation=${messagesPerConversation}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to sync messages');
    }
  }
);

// LAZY LOADING: Fetch only conversation overview (lightweight) for the left sidebar
export const fetchConversations = createAsyncThunk(
  'instagramMessages/fetchConversations',
  async (forceRefresh: boolean = false, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/dashboard/conversations?limit=20&platform=instagram&force_refresh=${forceRefresh}`);
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to fetch conversations');
    }
  }
);

// Fetch conversations needing attention (for polling)
export const fetchPendingAttentionConversations = createAsyncThunk(
  'instagramMessages/fetchPendingAttentionConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/dashboard/conversations/pending-attention?platform=instagram');
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to fetch pending conversations');
    }
  }
);

// Refresh all cached messages for all conversations
export const refreshAllCachedMessages = createAsyncThunk(
  'instagramMessages/refreshAllCachedMessages',
  async (conversationIds: string[], { rejectWithValue }) => {
    try {
      const messagePromises = conversationIds.map(conversationId =>
        apiClient.get(
          `/dashboard/messages/${conversationId}?platform=instagram&force_refresh=true&limit=20`
        )
      );
      const responses = await Promise.all(messagePromises);
      return responses.map((response, index) => ({
        conversationId: conversationIds[index],
        data: response.data,
      }));
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to refresh messages');
    }
  }
);

// INITIAL SYNC: Fetch recent conversations with all messages on login
export const initialSyncConversationsWithMessages = createAsyncThunk(
  'instagramMessages/initialSyncConversationsWithMessages',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch conversations with all messages for recent conversations
      const response = await apiClient.get('/dashboard/conversations?limit=20&platform=instagram&include_messages=true');
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to sync conversations with messages');
    }
  }
);

// LAZY LOADING: Fetch full messages only when user clicks on a conversation
export const fetchMessages = createAsyncThunk(
  'instagramMessages/fetchMessages',
  async (
    { conversationId, forceRefresh = false, offset = 0 }: { conversationId: string; forceRefresh?: boolean; offset?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.get<ConversationDetailResponse>(
        `/dashboard/messages/${conversationId}?platform=instagram&force_refresh=${forceRefresh}&limit=20&offset=${offset}`
      );
      return {
        conversationId,
        offset,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to fetch messages');
    }
  }
);

// Send QR code to customer
export const sendQRCode = createAsyncThunk(
  'instagramMessages/sendQRCode',
  async (
    { conversationId, qrCodeUrl, recipientUserId }: { conversationId: string; qrCodeUrl: string; recipientUserId: string },
    { rejectWithValue }
  ) => {
    try {
      // The qrCodeUrl is already a public URL from Settings (S3 bucket)
      // Send it directly via reply endpoint with attachment
      const response = await apiClient.post(
        `/dashboard/reply`,
        {
          conversation_id: conversationId,
          recipient_user_id: recipientUserId,
          message: 'Payment QR Code - Please scan to complete your payment',
          platform: 'instagram',
          attachment_url: qrCodeUrl,
          attachment_type: 'image'
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to send QR code');
    }
  }
);

// AI Handover: Pause AI
export const pauseAI = createAsyncThunk(
  'instagramMessages/pauseAI',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/dashboard/conversations/${conversationId}/pause-ai`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to pause AI');
    }
  }
);

// AI Handover: Resume AI
export const resumeAI = createAsyncThunk(
  'instagramMessages/resumeAI',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/dashboard/conversations/${conversationId}/resume-ai`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to resume AI');
    }
  }
);

// AI Handover: Mark Resolved
export const markResolved = createAsyncThunk(
  'instagramMessages/markResolved',
  async (
    { conversationId, resumeAI = true }: { conversationId: string; resumeAI?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(
        `/dashboard/conversations/${conversationId}/mark-resolved`,
        resumeAI
      );
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to mark resolved');
    }
  }
);

const instagramMessagesSlice = createSlice({
  name: 'instagramMessages',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload;
      // Load messages from cache if available, otherwise empty
      if (action.payload && state.messageCache[action.payload]) {
        state.messages = state.messageCache[action.payload].messages;
        state.businessUsername = state.messageCache[action.payload].businessUsername;
      } else {
        state.messages = [];
      }
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      // Also update cache
      if (state.currentConversationId && state.messageCache[state.currentConversationId]) {
        state.messageCache[state.currentConversationId].messages.push(action.payload);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentConversationId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Clear entire message cache (on logout, etc.)
    clearMessageCache: (state) => {
      state.messageCache = {};
      state.messages = [];
      state.currentConversationId = null;
    },
  },
  extraReducers: (builder) => {
    // Sync messages
    builder
      .addCase(syncInstagramMessages.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncInstagramMessages.fulfilled, (state, action) => {
        state.syncing = false;
        state.lastSyncedAt = new Date().toISOString();
        // Sync returns conversations, so we can update them
        if (Array.isArray(action.payload)) {
          state.conversations = action.payload;
        }
      })
      .addCase(syncInstagramMessages.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload as string;
      });

    // Initial sync: Fetch conversations with all messages on login
    builder
      .addCase(initialSyncConversationsWithMessages.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(initialSyncConversationsWithMessages.fulfilled, (state, action) => {
        state.syncing = false;
        state.lastSyncedAt = new Date().toISOString();
        
        // Update conversations and cache messages
        const conversations = Array.isArray(action.payload) ? action.payload : [];
        state.conversations = conversations;
        state.conversationsLoaded = true;
        
        // Cache all messages from the initial sync
        conversations.forEach((conversation: Conversation & { messages?: Message[]; instagram_username?: string }) => {
          if (conversation.conversation_id && conversation.messages) {
            state.messageCache[conversation.conversation_id] = {
              messages: conversation.messages,
              businessUsername: conversation.instagram_username || null,
              fetchedAt: Date.now(),
              hasMore: false,
              total: conversation.messages.length,
              offset: 0,
            };
          }
        });
      })
      .addCase(initialSyncConversationsWithMessages.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload as string;
      });

    // Fetch conversations (lightweight - just for sidebar)
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversationLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationLoading = false;
        // The response is now an array of conversations directly
        state.conversations = Array.isArray(action.payload) ? action.payload : [];
        state.conversationsLoaded = true;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationLoading = false;
        state.error = action.payload as string;
        state.conversations = [];
      });

    // Fetch pending attention conversations (polling)
    builder
      .addCase(fetchPendingAttentionConversations.fulfilled, (state, action) => {
        // Update existing conversations with attention flags
        const pendingConversations = Array.isArray(action.payload) ? action.payload : [];
        pendingConversations.forEach((pendingConvo: Conversation) => {
          const existingConvo = state.conversations.find(c => c.conversation_id === pendingConvo.conversation_id);
          if (existingConvo) {
            existingConvo.needs_human_attention = pendingConvo.needs_human_attention;
            existingConvo.handover_reason = pendingConvo.handover_reason;
            existingConvo.ai_paused = pendingConvo.ai_paused;
            existingConvo.updated_time = pendingConvo.updated_time;
          }
        });
      });

    // Fetch full messages (lazy loading - only on demand)
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const offset = action.meta.arg.offset || 0;
        if (offset === 0) {
          state.messageLoading = true;
        } else {
          state.loadingOlderMessages = true;
        }
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messageLoading = false;
        state.loadingOlderMessages = false;
        const { conversationId, offset, data } = action.payload;
        const messages = data.messages || [];
        const businessUsername = data.instagram_username || null;
        const hasMore = data.has_more || false;
        const total = data.total || 0;
        
        console.log('✅ Messages fetched for conversation:', conversationId);
        console.log('📨 Number of messages:', messages.length);
        console.log('📨 Has more:', hasMore, 'Total:', total, 'Offset:', offset);
        
        // If offset is 0, replace messages, otherwise append to existing
        if (offset === 0) {
          state.messageCache[conversationId] = {
            messages,
            businessUsername,
            fetchedAt: Date.now(),
            hasMore,
            total,
            offset: messages.length,
          };
        } else {
          // Append older messages to the beginning of the array
          const existingCache = state.messageCache[conversationId];
          if (existingCache) {
            state.messageCache[conversationId] = {
              ...existingCache,
              messages: [...messages, ...existingCache.messages],
              hasMore,
              offset: existingCache.offset + messages.length,
            };
          }
        }
        
        // Set as current if this is the current conversation
        if (state.currentConversationId === conversationId) {
          const cache = state.messageCache[conversationId];
          state.messages = cache.messages;
          state.businessUsername = cache.businessUsername;
          state.hasMore = cache.hasMore;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messageLoading = false;
        state.loadingOlderMessages = false;
        state.error = action.payload as string;
      });

    // Refresh all cached messages
    builder
      .addCase(refreshAllCachedMessages.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(refreshAllCachedMessages.fulfilled, (state, action) => {
        state.syncing = false;
        state.lastSyncedAt = new Date().toISOString();
        
        // Update message cache with fresh data
        action.payload.forEach((item: { conversationId: string; data: ConversationDetailResponse }) => {
          const messages = item.data.messages || [];
          const businessUsername = item.data.instagram_username || null;
          
          state.messageCache[item.conversationId] = {
            messages,
            businessUsername,
            fetchedAt: Date.now(),
            hasMore: item.data.has_more || false,
            total: item.data.total || messages.length,
            offset: 0,
          };
          
          // If this is the current conversation, update it too
          if (state.currentConversationId === item.conversationId) {
            state.messages = messages;
            state.businessUsername = businessUsername;
          }
        });
      })
      .addCase(refreshAllCachedMessages.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload as string;
      });

    // Send QR code
    builder
      .addCase(sendQRCode.pending, (state) => {
        state.error = null;
      })
      .addCase(sendQRCode.fulfilled, (state) => {
        state.error = null;
        // Message will be added to conversation via WebSocket or polling
      })
      .addCase(sendQRCode.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Pause AI
    builder
      .addCase(pauseAI.fulfilled, (state, action) => {
        const { conversation_id, ai_paused, needs_human_attention, handover_reason } = action.payload;
        const conversation = state.conversations.find(c => c.conversation_id === conversation_id);
        if (conversation) {
          conversation.ai_paused = ai_paused;
          conversation.needs_human_attention = needs_human_attention;
          conversation.handover_reason = handover_reason;
        }
      })
      .addCase(pauseAI.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Resume AI
    builder
      .addCase(resumeAI.fulfilled, (state, action) => {
        const { conversation_id, ai_paused, needs_human_attention } = action.payload;
        const conversation = state.conversations.find(c => c.conversation_id === conversation_id);
        if (conversation) {
          conversation.ai_paused = ai_paused;
          conversation.needs_human_attention = needs_human_attention;
          conversation.handover_reason = null;
        }
      })
      .addCase(resumeAI.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Mark Resolved
    builder
      .addCase(markResolved.fulfilled, (state, action) => {
        const { conversation_id, ai_paused, needs_human_attention } = action.payload;
        const conversation = state.conversations.find(c => c.conversation_id === conversation_id);
        if (conversation) {
          conversation.ai_paused = ai_paused;
          conversation.needs_human_attention = needs_human_attention;
          if (!needs_human_attention) {
            conversation.handover_reason = null;
          }
        }
      })
      .addCase(markResolved.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentConversation, addMessage, clearMessages, clearError, clearMessageCache } = instagramMessagesSlice.actions;
export default instagramMessagesSlice.reducer;
