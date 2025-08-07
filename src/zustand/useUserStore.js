import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  deviceMACs: null,
  setDeviceMACs: (macs) => set({ deviceMACs: macs }),
}));
