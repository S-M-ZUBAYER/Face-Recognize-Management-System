import { create } from "zustand";

const useSubscriptionStore = create((set) => ({
  paymentStatus: true,
  setPaymentStatus: (value) => set({ paymentStatus: value }),
  // For subscription modal
  isSubscriptionModal: false,
  setIsSubscriptionModal: (value) => set({ isSubscriptionModal: value }),

  // For required modal (new)
  isSubscriptionRequiredModal: false,
  setIsSubscriptionRequiredModal: (value) =>
    set({ isSubscriptionRequiredModal: value }),

  // Open both modals in sequence
  openSubscriptionFlow: () =>
    set({
      isSubscriptionRequiredModal: true,
      isSubscriptionModal: false,
    }),

  // Close both modals
  closeAllModals: () =>
    set({
      isSubscriptionRequiredModal: false,
      isSubscriptionModal: false,
    }),
}));

export default useSubscriptionStore;
