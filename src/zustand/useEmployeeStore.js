import { create } from "zustand";

export const useEmployeeStore = create((set) => ({
  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),

  employees: [],
  setEmployees: (employees) => set({ employees }),
  globalSalaryRules: [],
  setGlobalSalaryRules: (salaryRules) =>
    set({ globalSalaryRules: salaryRules }),

  attendance: [],
  setAttendance: (attendance) => set({ attendance }),

  attendedEmployees: [],
  setAttendedEmployees: (employees) => set({ attendedEmployees: employees }),

  absentEmployees: [],
  setAbsentEmployees: (employees) => set({ absentEmployees: employees }),

  totalEmployees: 0,
  setTotalEmployees: (total) => set({ totalEmployees: total }),
  totalPresent: 0,
  setTotalPresent: (total) => set({ totalPresent: total }),
  totalAbsent: 0,
  setTotalAbsent: (total) => set({ totalAbsent: total }),
  totalLate: 0,
  setTotalLate: (total) => set({ totalLate: total }),

  hasFetchedEmployees: false,
  setHasFetchedEmployees: (value) => set({ hasFetchedEmployees: value }),
  hasFetchedSalaryRules: false,
  setHasFetchedSalaryRules: (value) => set({ hasFetchedSalaryRules: value }),
}));
