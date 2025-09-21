import { useQueries } from "@tanstack/react-query";
import axios from "axios";

export const usePayPeriod = () => {
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");
  const payPeriodQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["payPeriod", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/payPeriod/check/${mac.deviceMAC}`
        );
        return {
          deviceMAC: mac.deviceMAC,
          payPeriod: JSON.parse(res.data.payPeriod),
        };
      },
    })),
  });
  const payPeriodData = payPeriodQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  return {
    payPeriodData,
    isLoading: payPeriodQueries.some((q) => q.isLoading),
    refetch: () => payPeriodQueries.forEach((q) => q.refetch?.()),
  };
};
