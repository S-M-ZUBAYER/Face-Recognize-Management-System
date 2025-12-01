import { create } from "zustand";

export const useEmployeeStore = create((set, get) => ({
  employeesArray: [],

  // --- Set full array ---
  setEmployeesArray: (data) => set({ employeesArray: data }),

  // --- Computed Active Employees ---
  employees: () => {
    const today = new Date().toISOString().split("T")[0];
    return get().employeesArray.filter(
      (e) => e.address?.type !== "resigned" || e.address?.r_date >= today
    );
  },

  // --- Computed Resigned Employees ---
  resignedEmployees: () => {
    const today = new Date().toISOString().split("T")[0];
    return get().employeesArray.filter(
      (e) => e.address?.type === "resigned" && e.address?.r_date < today
    );
  },

  // --- Update any employee field ---
  updateEmployee: (employeeId, updateData) => {
    set((state) => ({
      employeesArray: state.employeesArray.map((emp) =>
        emp.employeeId === employeeId ? { ...emp, ...updateData } : emp
      ),
    }));
  },
}));
