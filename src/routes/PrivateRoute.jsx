import { useEffect, useState } from "react";
import { useUserStore } from "@/zustand/useUserStore";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [user, setUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
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
