import { createSlice } from '@reduxjs/toolkit';
import { setItem, deleteItem } from '../../utils/storage';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    justLoggedIn: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, justLoggedIn } = action.payload;
      state.user = user;
      state.token = token;
      state.justLoggedIn = !!justLoggedIn;
      if (token) {
        setItem('userToken', token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.justLoggedIn = false;
      deleteItem('userToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
