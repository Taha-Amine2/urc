import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { User } from '../model/common'; 

interface UsersState {
  list: User[];
  loading: boolean;
  error?: string | null;
}

const initialState: UsersState = {
  list: [],
  loading: false,
  error: null,
};

// Action to fetch all users
export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/getusers');
      return response.data.results;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk<User, User, { rejectValue: string }>(
  'users/createUser',
  async (newUser, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/register', newUser);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.message || 'Failed to create user');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      });

    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create user';
      });
  },
});

export default usersSlice.reducer;