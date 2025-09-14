import { useQueries } from "@tanstack/react-query";
import axios from "axios";

export const useAttendance = (selectedDate) => {
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");
  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance", mac.deviceMAC, selectedDate],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/attendance/attendance-by-date-device`,
          { params: { macId: mac.deviceMAC, date: selectedDate } }
        );
        return res.data;
      },
    })),
  });

  const attendanceData = attendanceQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  return {
    attendanceData,
    isLoading: attendanceQueries.some((q) => q.isLoading),
    refetch: () => attendanceQueries.forEach((q) => q.refetch?.()),
  };
};
