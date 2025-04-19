import axiosClient from "@/lib/AxiosClient";
import { setUser, logout } from "@/Redux/slices/authSlice";
import { checkAuthStatus } from "@/Redux/slices/authSlice";

/**
 * Checks if user is authenticated - first checks Redux store, then API if needed
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<boolean>} - true if authenticated, false otherwise
 */
export const checkAuthAndUpdateStore = async (dispatch) => {
  try {
    // Use the proper async thunk to check auth status
    const resultAction = await dispatch(checkAuthStatus());

    // If the action was fulfilled, authentication was successful
    if (checkAuthStatus.fulfilled.match(resultAction)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

/**
 * Utility function to check authentication status
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 */
export const checkAuthentication = async () => {
  try {
    const response = await axiosClient.get("/auth/isLoggedIn");
    return {
      success: response.data.success,
      user: response.data.user,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Authentication check failed",
    };
  }
};
