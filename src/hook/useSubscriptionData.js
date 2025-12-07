import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
export function usePaymentInfo(email) {
  return useQuery({
    queryKey: ["payment-info", email],
    queryFn: () => fetchPaymentInfo(email),
    enabled: !!email, // Only run when email exists
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: false,
  });
}
