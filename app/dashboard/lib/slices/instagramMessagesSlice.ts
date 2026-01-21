import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../apiClient';
import type { Conversation, ConversationDetailResponse, Message } from '@/app/dashboard/message/instagram/types';

interface InstagramMessagesState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  businessUsername: string | null;
  loading: boolean;
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
  loading: false,
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

export const fetchConversations = createAsyncThunk(
  'instagramMessages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/dashboard/conversations?limit=25');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch conversations');
    }
  }
);

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
      return response.data;
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
      if (!action.payload) {
        state.messages = [];
      }
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentConversationId = null;
    },
    clearError: (state) => {
      state.error = null;
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

    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        // The response is now an array of conversations directly
        state.conversations = Array.isArray(action.payload) ? action.payload : [];
        state.conversationsLoaded = true;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.conversations = [];
      });

    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages || [];
        state.businessUsername = action.payload.instagram_username || null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.messages = [];
      });
  },
});

export const { setCurrentConversation, addMessage, clearMessages, clearError } = instagramMessagesSlice.actions;
export default instagramMessagesSlice.reducer;
