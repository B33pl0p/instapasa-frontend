import { configureStore } from '@reduxjs/toolkit';
import instagramMessagesReducer from './slices/instagramMessagesSlice';
import messengerMessagesReducer from './slices/messengerMessagesSlice';
import customerReducer from './slices/customerSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import businessConfigReducer from './slices/businessConfigSlice';

export const store = configureStore({
  reducer: {
    instagramMessages: instagramMessagesReducer,
    messengerMessages: messengerMessagesReducer,
    customer: customerReducer,
    products: productReducer,
    orders: orderReducer,
    businessConfig: businessConfigReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
