// Create: lib/apiClient.js
import axios from "axios";
import { API_CONFIG } from "./config";

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

    // Enhanced error handling
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout - please check your connection");
    }

    if (!error.response) {
      throw new Error("Network error - please check your internet connection");
    }

    if (error.response.status >= 500) {
      throw new Error("Server error - please try again later");
    }

    throw error;
  }
);

export default apiClient;
