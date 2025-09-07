import { create } from "zustand";

export const useEmployeeStore = create((set) => ({
  selectedEmployee: null,
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
}));
