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
  if (!email) return null; // prevent API call with empty email

  const res = await axios.get(`${BASE_URL}/paymentInfo/${email}`);
  return res.data?.data || res.data;
}

// Hook
export function usePaymentInfo() {
  const { user } = useUserData();
  const { setPaymentStatus } = useSubscriptionStore();

  const response = useQuery({
    queryKey: ["payment-info", user?.userEmail],
    queryFn: () => fetchPaymentInfo(user?.userEmail),
    enabled: !!user?.userEmail,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: false,
  });

  // Update Zustand ONLY when response.data changes
  useEffect(() => {
    if (response.data?.paymentStatus === 0) {
      setPaymentStatus(false);
    } else if (response.data?.paymentStatus === 1) {
      setPaymentStatus(true);
    }
    console.log(response.data);
  }, [response.data, setPaymentStatus]);

  return response.data;
}
