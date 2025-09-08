import { create } from "zustand";

export const useDateStore = create((set) => ({
  selectedMonth: new Date().getMonth(), // 0-11 (January-December)
  selectedYear: new Date().getFullYear(),
  setMonth: (month) => set({ selectedMonth: month }),
  setYear: (year) => set({ selectedYear: year }),
}));
