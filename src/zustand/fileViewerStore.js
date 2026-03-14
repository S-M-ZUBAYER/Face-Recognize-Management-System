// store/fileViewerStore.js
import { create } from "zustand";

const useFileViewerStore = create((set) => ({
  isOpen: false,
  fileUrl: null,
  fileName: null,
  fileType: null,

  openFileViewer: (url, name) => {
    // Determine file type
    const extension = url?.split(".").pop()?.toLowerCase() || "";
    let type = "other";

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
      type = "image";
    } else if (extension === "pdf") {
      type = "pdf";
    }

    set({
      isOpen: true,
      fileUrl: url,
      fileName: name || url?.split("/").pop() || "document",
      fileType: type,
    });
  },

  closeFileViewer: () => {
    set({
      isOpen: false,
      fileUrl: null,
      fileName: null,
      fileType: null,
    });
  },
}));

export default useFileViewerStore;
