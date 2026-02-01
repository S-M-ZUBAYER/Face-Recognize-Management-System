import { create } from "zustand";

export const useEmployeeStore = create((set, get) => ({
  employeesArray: [],
  employeeCounts: [],
  deviceCount: 0,

  // --- Set full array ---
  setEmployeesArray: (data) => set({ employeesArray: data }),
  setEmployeeCount: (count) => set({ employeeCounts: count }),
  setDeviceCount: (count) => set({ deviceCount: count }),

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
  updateEmployee: (employeeId, deviceMAC, updateData) => {
    set((state) => ({
      employeesArray: state.employeesArray.map((emp) =>
        emp.employeeId === employeeId && emp.deviceMAC === deviceMAC
          ? { ...emp, ...updateData }
          : emp
      ),
    }));
  },
}));
