import { create } from "zustand";

// Zustand store for date range
export const useDateRangeStore = create((set) => ({
  startDate: null, // Format: "2025-09-01"
  endDate: null, // Format: "2025-09-30"
  setDateRange: (startDate, endDate) => set({ startDate, endDate }),
  clearDateRange: () => set({ startDate: null, endDate: null }),

  // Helper method to get formatted range for display
  getFormattedRange: () => {
    const state = useDateRangeStore.getState();
    if (!state.startDate || !state.endDate) return null;

    const formatDate = (dateStr) => {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    return `${formatDate(state.startDate)} - ${formatDate(state.endDate)}`;
  },
}));
