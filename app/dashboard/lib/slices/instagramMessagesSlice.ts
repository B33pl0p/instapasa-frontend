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
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to sync messages');
    }
  }
);

// LAZY LOADING: Fetch only conversation overview (lightweight) for the left sidebar
export const fetchConversations = createAsyncThunk(
  'instagramMessages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/dashboard/conversations?limit=50&platform=instagram');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch conversations');
    }
  }
);

// LAZY LOADING: Fetch full messages only when user clicks on a conversation
export const fetchMessages = createAsyncThunk(
  'instagramMessages/fetchMessages',
  async (
    { conversationId, forceRefresh = false }: { conversationId: string; forceRefresh?: boolean },
    { rejectWithValue, getState }
  ) => {
    try {
      const response = await apiClient.get<ConversationDetailResponse>(
        `/dashboard/messages/${conversationId}?platform=instagram&force_refresh=${forceRefresh}`
      );
      return {
        conversationId,
        data: response.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch messages');
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
  },
});

export const { setCurrentConversation, addMessage, clearMessages, clearError, clearMessageCache } = instagramMessagesSlice.actions;
export default instagramMessagesSlice.reducer;
