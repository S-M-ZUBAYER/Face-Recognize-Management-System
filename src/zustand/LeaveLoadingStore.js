import { create } from "zustand";

const useLeaveLoadingStore = create((set) => ({
  isLoading: false,
  loadingMessage: "",
  loadingProgress: 0,
  loadingType: "default",
  setLoading: (isLoading, message = "", progress = 0, loadingType) =>
    set((state) => ({
      isLoading,
      loadingMessage: message,
      loadingProgress: progress,
      loadingType: !isLoading
        ? "default"
        : loadingType || state.loadingType || "default",
    })),
}));

export default useLeaveLoadingStore;
