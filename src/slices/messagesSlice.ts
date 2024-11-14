import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import axios from 'axios';

// Define the type for a message
interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string; // Assuming a string timestamp, could be Date if needed
}

// Define the type for the state
interface MessagesState {
  list: Message[];  // List of messages
  loading: boolean;  // Loading state
  error: string | null; // Error message if any
}

// Async thunk to fetch messages for a specific user
export const fetchMessages = createAsyncThunk<Message[], number, { rejectValue: string }>(
  'messages/fetchMessages',
  async (receiverId, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token missing');
      }
      const response = await axios.get(`/api/messagesget?receiver_id=${receiverId}`, {
        headers: {
          'Authentication': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: unknown) {
      // Ensure error is a string when rejecting
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Slice to store messages
const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    list: [],
    loading: false,
    error: null,
  } as MessagesState, // Type the state
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.list.push(action.payload); // Add the new message to the list
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
        state.list = action.payload; // Update the messages list with fetched messages
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Ensure error is treated as a string
      });
  },
});

export const { addMessage } = messagesSlice.actions;

// Selectors
export const selectMessages = (state: RootState) => state.messages.list;
export const selectMessagesLoading = (state: RootState) => state.messages.loading;
export const selectMessagesError = (state: RootState) => state.messages.error;

export default messagesSlice.reducer;
