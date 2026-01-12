import { create } from "zustand";

export const useGlobalStore = create((set) => ({
  globalRules: [],
  setGlobalRules: (rules) => set({ globalRules: rules }),
  payPeriodData: [],
  setPayPeriodData: (data) => set({ payPeriodData: data }),
}));
