import { useState } from "react";
import toast from "react-hot-toast";

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

      const response = await fetch(
        "https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/api/files/upload",
        {
          method: "POST",
          body: formData,
          // Browser automatically sets Content-Type with boundary
        }
      );

      // Read as text first to handle non-JSON responses
      const responseText = await response.text();

      // Check status code
      if (!response.ok) {
        console.error("Upload failed with status:", response.status);
        console.error("Response:", responseText);

        // Try to parse error as JSON
        if (responseText.startsWith("{")) {
          try {
            const errorData = JSON.parse(responseText);
            throw new Error(
              errorData.message ||
                `Upload failed with status ${response.status}`
            );
          } catch {
            throw new Error(`Upload failed with status ${response.status}`);
          }
        }
        throw new Error(`Upload failed with status ${response.status}`);
      }

      // Validate response is not empty
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      // Check if response is plain text URL or JSON
      let fileUrl;

      if (
        responseText.startsWith("http://") ||
        responseText.startsWith("https://")
      ) {
        // API returns direct URL as plain text
        fileUrl = responseText.trim();
      } else {
        // Try to parse as JSON
        try {
          const data = JSON.parse(responseText);
          fileUrl =
            data.fileUrl || data.url || data.data?.url || data.data?.fileUrl;
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          console.error("Raw response:", responseText);
          throw new Error("Server returned invalid response format");
        }
      }

      if (!fileUrl) {
        console.error("No file URL in response");
        throw new Error("No file URL returned from server");
      }

      toast.success("Image uploaded successfully!");
      return fileUrl;
    } catch (error) {
      console.error("Image upload error:", error.message);
      toast.error(error.message || "Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};
