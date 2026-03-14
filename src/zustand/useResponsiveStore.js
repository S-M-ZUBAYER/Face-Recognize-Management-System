import { create } from "zustand";

const useResponsiveStore = create((set) => ({
  isSmallLaptop: false,
  setIsSmallLaptop: (value) => set({ isSmallLaptop: value }),
  //   isMobile: false,
  //   isTablet: false,
  //   isDesktop: true,

  //   setIsMobile: (value) => set({ isMobile: value }),
  //   setIsTablet: (value) => set({ isTablet: value }),
  //   setIsDesktop: (value) => set({ isDesktop: value }),

  //   setResponsiveState: (isMobile, isTablet, isDesktop) =>
  //     set({ isMobile, isTablet, isDesktop }),
}));

export default useResponsiveStore;
