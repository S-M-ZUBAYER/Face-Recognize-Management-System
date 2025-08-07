import { create } from "zustand";

export const useEmployeeStore = create((set) => ({
  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),
  employees: null,
  setEmployees: (employees) => set({ employees: employees }),
  attendance: null,
  setAttendance: (attendance) => set({ attendance: attendance }),
  totalEmployees: 0,
  setTotalEmployees: (total) => set({ totalEmployees: total }),
  totalPresent: 0,
  setTotalPresent: (total) => set({ totalPresent: total }),
  totalAbsent: 0,
  setTotalAbsent: (total) => set({ totalAbsent: total }),
  totalLate: 0,
  setTotalLate: (total) => set({ totalLate: total }),
}));
