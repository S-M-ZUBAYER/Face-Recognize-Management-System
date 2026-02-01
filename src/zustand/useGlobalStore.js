import { create } from "zustand";

export const useGlobalStore = create((set, get) => ({
  globalRules: [],
  setGlobalRules: (rules) => set({ globalRules: rules }),
  payPeriodData: [],
  setPayPeriodData: (data) => set({ payPeriodData: data }),
  deviceMac: "",
  setDeviceMac: (mac) => set({ deviceMac: mac }),

  selectedRule: () => {
    return get().globalRules.find((rule) => rule.deviceMAC === get().deviceMac);
  },
  selectPayPeriod: () => {
    return get().payPeriodData.find(
      (period) => period.deviceMAC === get().deviceMac,
    );
  },

  // --- Update any salaryRule field ---

  updateSelectedRule: (updateData) => {
    set((state) => {
      const deviceMAC = get().deviceMac;
      const exists = state.globalRules.some((p) => p.deviceMAC === deviceMAC);

      return {
        globalRules: exists
          ? state.globalRules.map((p) =>
              p.deviceMAC === deviceMAC ? { ...p, ...updateData } : p,
            )
          : [...state.globalRules, { deviceMAC, ...updateData }],
      };
    });
  },

  // --- Update any payPeriod field ---

  updatePayPeriod: (updateData) => {
    set((state) => {
      const deviceMAC = get().deviceMac;
      const exists = state.payPeriodData.some((p) => p.deviceMAC === deviceMAC);

      return {
        payPeriodData: exists
          ? state.payPeriodData.map((p) =>
              p.deviceMAC === deviceMAC ? { ...p, ...updateData } : p,
            )
          : [...state.payPeriodData, { deviceMAC, ...updateData }],
      };
    });
  },
}));
