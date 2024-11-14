import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import roomsReducer from './slices/roomsSlice';
import messagesReducer from './slices/messagesSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    rooms: roomsReducer,
    messages: messagesReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;