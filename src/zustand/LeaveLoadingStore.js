import { create } from "zustand";

const useLeaveLoadingStore = create((set) => ({
  isLoading: false,
  loadingMessage: "",
  loadingProgress: 0,
  setLoading: (isLoading, message = "", progress = 0) =>
    set({ isLoading, loadingMessage: message, loadingProgress: progress }),
}));

export default useLeaveLoadingStore;
