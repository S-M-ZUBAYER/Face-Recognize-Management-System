import { create } from "zustand";

const useErrorStore = create((set) => ({
  error: null,
  isOpen: false,

  showError: (error) => {
    const errorMessage =
      typeof error === "string"
        ? error
        : error?.message || "An unexpected error occurred";

    set({
      error: errorMessage,
      isOpen: true,
    });
  },

  hideError: () => {
    set({
      error: null,
      isOpen: false,
    });
  },

  clearError: () => {
    set({
      error: null,
      isOpen: false,
    });
  },
}));

export default useErrorStore;
