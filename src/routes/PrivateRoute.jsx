import { useEffect, useState } from "react";
import { useUserStore } from "@/zustand/useUserStore";
import { Navigate, Outlet } from "react-router-dom";
import { checkSessionExpiry } from "@/lib/Session";
import { Riple } from "react-loading-indicators";

const PrivateRoute = () => {
  const { user, setUser, clearAll } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const isExpired = checkSessionExpiry();

      if (isExpired) {
        localStorage.removeItem("hideWarningModalRules");
        localStorage.removeItem("hideWarningModalPayPeriod");
        localStorage.removeItem("user");
        localStorage.removeItem("deviceMACs");
        localStorage.removeItem("lastLoginAt");
        localStorage.removeItem("lastActivityAt");
        setLoading(false);
        return;
      }

      if (!user) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [user, setUser, clearAll]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center relative z-500 bg-white">
        <Riple color="#004368" size="large" text="" textColor="" />
      </div>
    );
  }

  return user?.userEmail ? (
    <Outlet />
  ) : (
    <Navigate to="/Face_Attendance_Management_System/signin" replace />
  );
};

export default PrivateRoute;
