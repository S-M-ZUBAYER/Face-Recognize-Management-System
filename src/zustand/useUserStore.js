import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  deviceMACs: null,
  rulesIds: [],

  setRulesIds: (ids) => {
    set((state) => ({ rulesIds: [...state.rulesIds, ids] }));
  },

  clearRulesIds: () => set({ rulesIds: [] }),

  // set user and persist in localStorage "user"
  setUser: (userData) => {
    set({ user: userData });
    localStorage.setItem("user", JSON.stringify(userData));
  },

  // set device MACs and persist in localStorage "deviceMACs"
  setDeviceMACs: (macs) => {
    set({ deviceMACs: macs });
    localStorage.setItem("deviceMACs", JSON.stringify(macs));
  },

  // Optional: load data from localStorage when app starts
  loadFromStorage: () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs"));
    set({ user, deviceMACs });
  },

  // Optional: clear both
  clearAll: () => {
    set({ user: null, deviceMACs: null });
    localStorage.removeItem("user");
    localStorage.removeItem("deviceMACs");
  },
}));
