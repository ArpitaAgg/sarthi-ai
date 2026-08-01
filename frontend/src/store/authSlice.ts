import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; tokens: { accessToken: string; refreshToken: string } }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.tokens.accessToken);
        localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (storedUser && token && refreshToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser) {
              state.user = parsedUser;
              state.accessToken = token;
              state.refreshToken = refreshToken;
              state.isAuthenticated = true;
            } else {
              localStorage.clear();
              state.isAuthenticated = false;
            }
          } catch (e) {
            localStorage.clear();
            state.isAuthenticated = false;
          }
        } else {
          state.isAuthenticated = false;
        }
      }
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
  },
});

export const { setCredentials, initializeAuth, logout } = authSlice.actions;
export default authSlice.reducer;
