import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "@/lib/AxiosClient";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/auth/login", credentials);

      // Only consider it successful if success is true AND user exists
      if (response.data.success && response.data.user) {
        return response.data.user;
      } else {
        // If success is false, reject with the message
        return rejectWithValue(response.data.message || "Login failed");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const signUpUser = createAsyncThunk(
  "auth/signUpUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/auth/signup", {
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
        name: credentials.username,
      });

      // Similar check for signup
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message || "Signup failed");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/auth/isLoggedIn");
      console.log("Auth status response:", response.data);

      // Only consider authenticated if success is true AND user exists
      if (response.data.isLoggedIn && response.data.user) {
        return response.data.user;
      } else {
        return rejectWithValue(response.data.message || "Not authenticated");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Not authenticated"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/auth/logout");

      // Only consider logout successful if the backend confirms it
      if (response.data.message.includes("successfully")) {
        return null;
      } else {
        return rejectWithValue(response.data.message || "Logout failed");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // Now payload is directly the user object
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
      })
      // Signup
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Auth status check:", action.payload);

        state.user = action.payload; // Now payload is directly the user object
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        console.log("Auth status check:", action.payload);
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
