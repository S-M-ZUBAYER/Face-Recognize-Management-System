import { create } from "zustand";

export const useAttendanceStore = create((set) => ({
  selectedDate: new Date().toISOString().split("T")[0],
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
