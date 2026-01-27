import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../apiClient';

// Messenger types (similar to Instagram)
export interface MessengerParticipant {
  username: string;
  id: string;
}

export interface MessengerPostback {
  title: string;
  payload: string;
}

export interface MessengerAttachment {
  type: string;
  url: string;
  media?: any;
}

export interface MessengerMessage {
  id: string;
  created_time: string;
  text: string | null;
  from: MessengerParticipant;
  to: MessengerParticipant[];
  is_from_business: boolean;
  postback?: MessengerPostback | null;
  attachments?: MessengerAttachment[] | null;
  sticker?: string | null;
}

export interface MessengerConversation {
  platform: string;
  conversation_id: string;
  updated_time: string;
  participants: MessengerParticipant[];
  last_message: {
    id: string;
    created_time: string;
    text: string;
    from: MessengerParticipant;
    to: MessengerParticipant[];
  };
  buyer_id?: string;
  buyer_username?: string;
}

export interface MessengerMessagesOverviewResponse {
  page_id: string;
  platform: string;
  conversations: MessengerConversation[];
}

export interface MessengerConversationDetailResponse {
  page_id: string;
  platform: string;
  conversation_id: string;
  messages: MessengerMessage[];
}

// Cache for storing fetched messages per conversation
interface MessageCache {
  [conversationId: string]: {
    messages: MessengerMessage[];
    fetchedAt: number;
  };
}

interface MessengerMessagesState {
  conversations: MessengerConversation[];
  currentConversationId: string | null;
  messages: MessengerMessage[];
  messageCache: MessageCache;
  loading: boolean;
  conversationLoading: boolean;
  messageLoading: boolean;
  syncing: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  conversationsLoaded: boolean;
}

const initialState: MessengerMessagesState = {
  conversations: [],
  currentConversationId: null,
  messages: [],
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
export const syncMessengerMessages = createAsyncThunk(
  'messengerMessages/sync',
  async (
    params: { limit?: number; messagesPerConversation?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { limit = 50, messagesPerConversation = 50 } = params;
      const response = await apiClient.post(
        `/dashboard/sync?platform=facebook&limit=${limit}&messages_per_conversation=${messagesPerConversation}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to sync messages');
    }
  }
);

// LAZY LOADING: Fetch only conversation overview (lightweight) for the left sidebar
export const fetchMessengerConversations = createAsyncThunk(
  'messengerMessages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/dashboard/conversations?limit=50&platform=facebook');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch conversations');
    }
  }
);

// LAZY LOADING: Fetch full messages only when user clicks on a conversation
export const fetchMessengerMessages = createAsyncThunk(
  'messengerMessages/fetchMessages',
  async (
    { conversationId, forceRefresh = false }: { conversationId: string; forceRefresh?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.get<MessengerConversationDetailResponse>(
        `/dashboard/messages/${conversationId}?platform=facebook&force_refresh=${forceRefresh}`
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

const messengerMessagesSlice = createSlice({
  name: 'messengerMessages',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload;
      // Load messages from cache if available, otherwise empty
      if (action.payload && state.messageCache[action.payload]) {
        state.messages = state.messageCache[action.payload].messages;
      } else {
        state.messages = [];
      }
    },
    addMessage: (state, action: PayloadAction<MessengerMessage>) => {
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
      .addCase(syncMessengerMessages.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncMessengerMessages.fulfilled, (state, action) => {
        state.syncing = false;
        state.lastSyncedAt = new Date().toISOString();
        // Sync returns conversations, so we can update them
        if (Array.isArray(action.payload)) {
          state.conversations = action.payload;
        }
      })
      .addCase(syncMessengerMessages.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload as string;
      });

    // Fetch conversations (lightweight - just for sidebar)
    builder
      .addCase(fetchMessengerConversations.pending, (state) => {
        state.conversationLoading = true;
        state.error = null;
      })
      .addCase(fetchMessengerConversations.fulfilled, (state, action) => {
        state.conversationLoading = false;
        // The response is now an array of conversations directly
        state.conversations = Array.isArray(action.payload) ? action.payload : [];
        state.conversationsLoaded = true;
      })
      .addCase(fetchMessengerConversations.rejected, (state, action) => {
        state.conversationLoading = false;
        state.error = action.payload as string;
        state.conversations = [];
      });

    // Fetch full messages (lazy loading - only on demand)
    builder
      .addCase(fetchMessengerMessages.pending, (state) => {
        state.messageLoading = true;
        state.error = null;
      })
      .addCase(fetchMessengerMessages.fulfilled, (state, action) => {
        state.messageLoading = false;
        const { conversationId, data } = action.payload;
        const messages = data.messages || [];
        
        // Cache the messages by conversation_id
        state.messageCache[conversationId] = {
          messages,
          fetchedAt: Date.now(),
        };
        
        // Set as current if this is the current conversation
        if (state.currentConversationId === conversationId) {
          state.messages = messages;
        }
      })
      .addCase(fetchMessengerMessages.rejected, (state, action) => {
        state.messageLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentConversation, addMessage, clearMessages, clearError, clearMessageCache } = messengerMessagesSlice.actions;
export default messengerMessagesSlice.reducer;
