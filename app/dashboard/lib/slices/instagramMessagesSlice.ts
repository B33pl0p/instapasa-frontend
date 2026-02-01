import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../apiClient';
import type { Conversation, ConversationDetailResponse, Message } from '@/app/dashboard/message/instagram/types';

// Cache for storing fetched messages per conversation
interface MessageCache {
  [conversationId: string]: {
    messages: Message[];
    businessUsername: string | null;
    fetchedAt: number;
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
  syncing: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  conversationsLoaded: boolean;
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
  syncing: false,
  error: null,
  lastSyncedAt: null,
  conversationsLoaded: false,
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
      const response = await apiClient.get(`/dashboard/conversations?limit=100&platform=instagram&force_refresh=${forceRefresh}`);
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to fetch conversations');
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
          `/dashboard/messages/${conversationId}?platform=instagram&force_refresh=true`
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
      const response = await apiClient.get('/dashboard/conversations?limit=100&platform=instagram&include_messages=true');
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
    { conversationId, forceRefresh = false }: { conversationId: string; forceRefresh?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.get<ConversationDetailResponse>(
        `/dashboard/messages/${conversationId}?platform=instagram&force_refresh=${forceRefresh}`
      );
      return {
        conversationId,
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

    // Fetch full messages (lazy loading - only on demand)
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.messageLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messageLoading = false;
        const { conversationId, data } = action.payload;
        const messages = data.messages || [];
        const businessUsername = data.instagram_username || null;
        
        console.log('✅ Messages fetched for conversation:', conversationId);
        console.log('📨 Number of messages:', messages.length);
        console.log('📨 Messages:', messages);
        
        // Cache the messages by conversation_id
        state.messageCache[conversationId] = {
          messages,
          businessUsername,
          fetchedAt: Date.now(),
        };
        
        // Set as current if this is the current conversation
        if (state.currentConversationId === conversationId) {
          state.messages = messages;
          state.businessUsername = businessUsername;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messageLoading = false;
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
  },
});

export const { setCurrentConversation, addMessage, clearMessages, clearError, clearMessageCache } = instagramMessagesSlice.actions;
export default instagramMessagesSlice.reducer;
