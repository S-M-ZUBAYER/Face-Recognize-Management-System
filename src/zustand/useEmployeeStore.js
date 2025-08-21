import { create } from "zustand";

export const useEmployeeStore = create((set) => ({
  // Loading state
  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),

  // Employees & Salary Rules
  employees: [],
  setEmployees: (employees) => set({ employees }),
  globalSalaryRules: [],
  setGlobalSalaryRules: (salaryRules) =>
    set({ globalSalaryRules: salaryRules }),

  // Attendance
  attendance: [],
  setAttendance: (attendance) => set({ attendance }),

  // Totals
  totalEmployees: 0,
  setTotalEmployees: (total) => set({ totalEmployees: total }),
  totalPresent: 0,
  setTotalPresent: (total) => set({ totalPresent: total }),
  totalAbsent: 0,
  setTotalAbsent: (total) => set({ totalAbsent: total }),
  totalLate: 0,
  setTotalLate: (total) => set({ totalLate: total }),

  // Flags to check if data has been loaded once
  hasFetchedEmployees: false,
  setHasFetchedEmployees: (value) => set({ hasFetchedEmployees: value }),
  hasFetchedSalaryRules: false,
  setHasFetchedSalaryRules: (value) => set({ hasFetchedSalaryRules: value }),
}));
