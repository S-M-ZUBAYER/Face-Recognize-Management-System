import axios from "axios";
import { API_CONFIG } from "./config";
import useErrorStore from "@/zustand/useErrorStore";

const apiClient = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    // Only show error modal for GET requests
    if (error.config?.method?.toUpperCase() === "GET") {
      useErrorStore.getState().showError("Request failed - please try again");
    }
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    // Only show error modal for GET requests
    const isGetRequest = error.config?.method?.toUpperCase() === "GET";

    if (isGetRequest) {
      let errorMessage = "An unexpected error occurred";

      if (!error.response) {
        errorMessage = "Network error - please check your internet connection";
      } else if (error.response.status >= 500) {
        errorMessage = "Server error - please try again later";
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }

      // Show error modal only for GET requests
      useErrorStore.getState().showError(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
