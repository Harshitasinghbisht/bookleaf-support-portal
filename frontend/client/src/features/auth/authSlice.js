
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const initialState = {
 user: null,
  isAuthenticated: false,
  status: "idle",
  sessionStatus: "idle",
  error: null,
};

// Login with email and password
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const response = await authService.login(credentials);
      return response.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

// Restore the session from the HTTP-only cookie
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const response = await authService.getMe();
      return response.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "No active session."
      );
    }
  }
);

// Logout the current user
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await authService.logout();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Logout failed."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // Restore session
     .addCase(fetchCurrentUser.pending, (state) => {
  state.sessionStatus = "loading";
})
.addCase(fetchCurrentUser.fulfilled, (state, action) => {
  state.sessionStatus = "succeeded";
  state.user = action.payload;
  state.isAuthenticated = true;
  state.error = null;
})
.addCase(fetchCurrentUser.rejected, (state) => {
  state.sessionStatus = "failed";
  state.user = null;
  state.isAuthenticated = false;
  state.error = null;
})

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
