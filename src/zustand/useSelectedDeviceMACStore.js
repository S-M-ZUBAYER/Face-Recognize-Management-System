import { create } from "zustand";

export const useSelectedDeviceMACStore = create((set) => ({
  selectedDeviceMAC: "all",
  setSelectedDeviceMAC: (Mac) => set({ selectedDeviceMAC: Mac }),
}));
