import { create } from "zustand";

export const useEditEmployeeStore = create((set) => ({
  selectedEmployee: null,
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
}));
