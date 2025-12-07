import { create } from "zustand";

const useSubscriptionStore = create((set) => ({
  isSubscriptionModal: false,
  setIsSubscriptionModal: (value) => set({ isSubscriptionModal: value }),
}));

export default useSubscriptionStore;
