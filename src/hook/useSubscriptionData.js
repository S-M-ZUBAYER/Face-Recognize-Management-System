import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUserData } from "./useUserData";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";
import { useEffect } from "react";

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

    const expireDate = new Date(query.data.paymentExpireTime);
    const today = new Date();

    // Normalize both dates to start of day
    expireDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (query.data.paymentStatus === 0) {
      setPaymentStatus(false);
    }
    else if (
      query.data.package_name !== "FreeTrial" &&
      expireDate >= today
    ) {
      setPaymentStatus(true); // active / valid
    }
  }, [query.data]);



  return query; // 👍 return full query object
}
