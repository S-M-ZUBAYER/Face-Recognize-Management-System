import { create } from "zustand";

const useSelectedEmployeeStore = create((set) => ({
  selectedEmployees: [],

  // Set (append) a new selected employee
  setSelectedEmployees: (employee) =>
    set((state) => ({
      selectedEmployees: [...state.selectedEmployees, employee],
    })),

  // Clear all selections
  clearSelection: () => set({ selectedEmployees: [] }),

  // ✅ Update salaryInfo for a specific employee
  updateEmployeeSalaryInfo: (employeeId, newSalaryInfo) =>
    set((state) => ({
      selectedEmployees: state.selectedEmployees.map((emp) =>
        emp.employeeId === employeeId
          ? {
              ...emp,
              salaryInfo: newSalaryInfo,
            }
          : emp
      ),
    })),
}));

export default useSelectedEmployeeStore;
