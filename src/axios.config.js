import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Create a single axios instance to be used across the application
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20000,
});

/**
 * Makes an API request with timeout handling
 * @param {Promise} apiCall - The axios API call
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} - The API response or error
 */
export const makeApiRequest = async (apiCall, timeout = 20000) => {
  return Promise.race([
    apiCall,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    ),
  ]);
};

/**
 * Handles network errors in a consistent way
 * @param {Error} error - The error object
 * @returns {string} - A user-friendly error message
 */
export const handleNetworkError = (error) => {
  if (
    error.message === "Request timeout" ||
    error.code === "ECONNABORTED" ||
    error.message.includes("timeout")
  ) {
    return "Request timed out.";
  } else if (!navigator.onLine) {
    console.error("No internet connection.");
    return "No internet connection.";
  } else if (error.code === "ERR_NETWORK") {
    console.error("Cannot reach the server.");
    return "Cannot reach the server.";
  } else {
    console.error("An unexpected error occurred:", error);
    return error.response?.data?.message || "An unexpected error occurred.";
  }
};

/**
 * Generic API request handler with standard response formatting
 * @param {Function} apiCallFn - Function that makes the actual API call
 * @returns {Object} - Standardized response object
 */
export const handleApiRequest = async (apiCallFn) => {
  try {
    const response = await apiCallFn();

    if (response?.data) {
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Operation successful",
      };
    }

    return {
      success: false,
      message: "Invalid response from server",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.statusText ||
      handleNetworkError(error);

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Helper methods for common HTTP methods
export const apiService = {
  get: async (url, params = {}) => {
    return handleApiRequest(() =>
      makeApiRequest(axiosInstance.get(url, { params }))
    );
  },

  post: async (url, data = {}, options = {}) => {
    return handleApiRequest(() =>
      makeApiRequest(axiosInstance.post(url, data, options))
    );
  },

  put: async (url, data = {}) => {
    return handleApiRequest(() => makeApiRequest(axiosInstance.put(url, data)));
  },

  delete: async (url) => {
    return handleApiRequest(() => makeApiRequest(axiosInstance.delete(url)));
  },
};

export default apiService;
