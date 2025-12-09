import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUserData } from "./useUserData";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";
import { useEffect, useMemo } from "react";

const BASE_URL = "https://grozziieget.zjweiting.com:8033/tht/attendance";

// =========================================
// 1) Fetch Subscription / Payment Packages
// =========================================
async function fetchSubscriptionPackages() {
  const res = await axios.get(`${BASE_URL}/Payment/`);
  return res.data.data.packages || res.data.data;
}

// Hook
export function useSubscriptionData() {
  return useQuery({
    queryKey: ["payment-packages"],
    queryFn: fetchSubscriptionPackages,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: false,
  });
}

// =========================================
// 2) Fetch Payment Info By Email
// =========================================
async function fetchPaymentInfo(email) {
  if (!email) return null;
  const res = await axios.get(`${BASE_URL}/paymentInfo/${email}`);
  return res.data?.data || res.data;
}

export function usePaymentInfo() {
  const { user } = useUserData();
  const { setPaymentStatus } = useSubscriptionStore();
  const currentDate = useMemo(() => new Date(), []);

  const query = useQuery({
    queryKey: ["payment-info", user?.userEmail],
    queryFn: () => fetchPaymentInfo(user?.userEmail),
    enabled: !!user?.userEmail,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: false,
  });

  // Run when query finishes
  useEffect(() => {
    if (!query.data) return;

    if (query.data.paymentStatus === 0) {
      setPaymentStatus(false);
    } else if (
      query.data.paymentStatus === 1 &&
      query.data.package_name !== "FreeTrial" &&
      new Date(query.data.paymentExpireTime) < currentDate
    ) {
      setPaymentStatus(true);
    }
  }, [query.data, setPaymentStatus, currentDate]);

  return query; // 👍 return full query object
}
