import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Room {
  room_id: number;
  name: string;
  created_on: string;
}

interface RoomsState {
  list: Room[];
  loading: boolean;
  error?: string | null;
}

const initialState: RoomsState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk<Room[], void, { rejectValue: string }>(
  'rooms/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token missing');
      }
      const response = await axios.get('/api/rooms', {
        headers: {
          'Authentication': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch rooms');
    }
  }
);

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRooms.fulfilled, (state, action: PayloadAction<Room[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch rooms';
      });
  },
});

export default roomsSlice.reducer;
