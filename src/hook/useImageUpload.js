import { useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file) => {
    if (!file) return null;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files (JPEG, PNG, GIF, WebP) are allowed");
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      // Use apiClient for consistent error handling and timeouts
      const response = await apiClient.post(
        getApiUrl("/api/files/upload"),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 seconds for file uploads
        }
      );

      // apiClient automatically handles response parsing and errors
      const responseData = response.data;

      // Extract file URL from various possible response structures
      let fileUrl =
        responseData?.fileUrl ||
        responseData?.url ||
        responseData?.data?.url ||
        responseData?.data?.fileUrl ||
        responseData; // In case response is direct URL string

      if (!fileUrl) {
        console.error("No file URL in response:", responseData);
        throw new Error("No file URL returned from server");
      }

      // Ensure URL is absolute (prepend base URL if relative)
      if (fileUrl.startsWith("/")) {
        fileUrl = `${getApiUrl("")}${fileUrl}`;
      }

      toast.success("Image uploaded successfully!");
      return fileUrl;
    } catch (error) {
      console.error("Image upload error:", error);

      let errorMessage = "Failed to upload image";

      if (error.code === "ECONNABORTED") {
        errorMessage = "Upload timeout - please try again";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (!navigator.onLine) {
        errorMessage = "Network connection lost - please check your internet";
      }

      toast.error(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};
