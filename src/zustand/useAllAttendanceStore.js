import { create } from "zustand";

export const useAllAttendanceStore = create((set, get) => ({
  attendanceArray: [],

  setAttendanceArray: (data) => set({ attendanceArray: data }),

  getAttendanceByEmployeeAndDateRange: (employeeId, startDate, endDate) => {
    const { attendanceArray } = get();

    return attendanceArray.filter((item) => {
      return (
        String(item.employeeId) === String(employeeId) &&
        item.date >= startDate &&
        item.date <= endDate
      );
    });
  },
}));
