import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const useAttendanceStore = create(
  subscribeWithSelector((set) => ({
    selectedDate: new Date().toISOString().split("T")[0],
    activeFilter: "all",
    isLoading: false,
    setSelectedDate: (date) =>
      set({
        selectedDate:
          typeof date === "string" && !isNaN(new Date(date).getTime())
            ? date
            : new Date().toISOString().split("T")[0],
      }),
    setActiveFilter: (value) =>
      set({
        activeFilter: ["all", "present", "absent", "overtime"].includes(value)
          ? value
          : "all",
      }),
    setIsLoading: (value) => set({ isLoading: !!value }),
  }))
);
