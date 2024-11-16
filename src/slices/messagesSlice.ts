import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import axios from 'axios';

interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
}

interface Messagegrp {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  sender_name:string;
  content: string;
  timestamp: string;
}

interface MessagesState {
  list: Message[];
  listgrp: Messagegrp[];
  loading: boolean;
  error: string | null;
}

export const fetchMessages = createAsyncThunk<Message[], { receiverId: number; receiverType: string }, { rejectValue: string }>(
  'messages/fetchMessages',
  async ({ receiverId, receiverType }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return rejectWithValue('Token missing');

      const response = await axios.get(`/api/messagesget?receiver_id=${receiverId}&receiver_type=${receiverType}`, {
        headers: {
          'Authentication': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const fetchMessagesGrp = createAsyncThunk<Messagegrp[], { receiverId: number; receiverType: string }, { rejectValue: string }>(
  'messages/fetchMessagesGrp',
  async ({ receiverId, receiverType }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return rejectWithValue('Token missing');

      const response = await axios.get(`/api/messagesget?receiver_id=${receiverId}&receiver_type=${receiverType}`, {
        headers: {
          'Authentication': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const sendMessage = createAsyncThunk<Message, { receiverId: number; content: string }, { rejectValue: string }>(
  'messages/sendMessage',
  async ({ receiverId, content }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem('token');
      const senderId = Number(sessionStorage.getItem('id'));

      if (!token || !senderId) return rejectWithValue('Token or sender ID missing');

      const response = await axios.post(
        '/api/messages',
        {
          receiver_id: receiverId,
          content: content,
          sender_id: senderId,
          receiver_type: 'user',
        },
        {
          headers: {
            'Authentication': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    list: [],
    listgrp: [],
    loading: false,
    error: null,
  } as MessagesState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.list.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.list.push(action.payload); // Add new message to list
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { addMessage } = messagesSlice.actions;

// Selectors
export const selectMessages = (state: RootState) => state.messages.list;
export const selectMessagesgrp = (state: RootState) => state.messages.listgrp;
export const selectMessagesLoading = (state: RootState) => state.messages.loading;
export const selectMessagesError = (state: RootState) => state.messages.error;

export default messagesSlice.reducer;
