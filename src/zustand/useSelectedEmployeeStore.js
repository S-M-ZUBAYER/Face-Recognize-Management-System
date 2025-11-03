import { create } from "zustand";

const useSelectedEmployeeStore = create((set) => ({
  selectedEmployees: [],

  clearSelection: () =>
    set({
      selectedEmployees: [],
    }),

  setSelectedEmployees: (employee) =>
    set((state) => ({
      selectedEmployees: [...state.selectedEmployees, employee],
    })),
}));

export default useSelectedEmployeeStore;
