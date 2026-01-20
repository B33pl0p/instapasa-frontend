import { configureStore } from '@reduxjs/toolkit';
import instagramMessagesReducer from './slices/instagramMessagesSlice';
import messengerMessagesReducer from './slices/messengerMessagesSlice';
import customerReducer from './slices/customerSlice';

export const store = configureStore({
  reducer: {
    instagramMessages: instagramMessagesReducer,
    messengerMessages: messengerMessagesReducer,
    customer: customerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
