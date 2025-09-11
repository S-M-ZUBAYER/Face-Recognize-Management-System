import { useQueries } from "@tanstack/react-query";
import axios from "axios";

export const useAttendanceData = () => {
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");
  // Attendance per deviceMAC
  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/attendance/attendance-by-device?deviceId=${mac.deviceMAC}`
        );
        return res.data;
      },
    })),
  });

  const Attendance = attendanceQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  const isLoading = attendanceQueries.some((q) => q.isLoading);
  const isError = attendanceQueries.some((q) => q.isError);

  return {
    Attendance,
    isLoading,
    isError,
  };
};
