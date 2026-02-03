import { Route, Routes, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Animated404 from "../components/404";
import Dashboard from "../pages/Dashboard";
import SignInPage from "../pages/SignInPage";
import EmployeePage from "@/pages/EmployeePage";
import SalaryCalculationPage from "@/pages/SalaryCalculationPage";
import DeviceManagementPage from "@/pages/DeviceManagementPage";
import AdminManagementPage from "@/pages/AdminManagementPage";
import EmployeeManagementPage from "@/pages/EmployeeManagementPage";
import TaskManagementPage from "@/pages/TaskManagementPage";
import LeaveApprovalPage from "@/pages/LeaveApprovalPage";
import AttendancePage from "@/pages/AttendancePage";
import RulesPage from "@/pages/RulesPage";
import PrivateRoute from "./PrivateRoute"; // ✅ import
import EditEmployeeDetailsPage from "@/pages/EditEmployeeDetailsPage";
import PayPeriodPage from "@/pages/PayPeriodPage";
import ResignedEmployeePage from "@/pages/ResignedEmployeePage";
import EmailVerification from "@/components/EmailVerification";
import { useEffect, useState } from "react";
import { getAllEmployeeData } from "@/utils/initializes/getAllEmployeeData";
import { Riple } from "react-loading-indicators";
// import { fetchLeavesData } from "@/utils/leaveServices/LeaveDataService";

const AppLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        await getAllEmployeeData();
        // await fetchLeavesData();
      } catch (error) {
        console.error("employee Api error", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (isLoading) {
    return (
      <div className="w-screen h-[100vh] flex justify-center items-center relative z-500 bg-white">
        <Riple color="#004368" size="large" text="" textColor="" />
      </div>
    );
  }
  return (
    <div className="flex h-[100vh] w-[100vw] font-poppins-regular ">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="p-6 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route
          path="/Face_Attendance_Management_System"
          element={<AppLayout />}
        >
          <Route index element={<Dashboard />} />
          <Route
            path="/Face_Attendance_Management_System/employee"
            element={<EmployeePage />}
          />
          <Route
            path="/Face_Attendance_Management_System/resigned-employee"
            element={<ResignedEmployeePage />}
          />
          <Route
            path="/Face_Attendance_Management_System/salary-calculation"
            element={<SalaryCalculationPage />}
          />
          {/* <Route path="attendance" element={<Warehouse />} /> */}
          <Route
            path="/Face_Attendance_Management_System/device-management"
            element={<DeviceManagementPage />}
          />
          <Route
            path="/Face_Attendance_Management_System/admin-management"
            element={<AdminManagementPage />}
          />
          <Route
            path="/Face_Attendance_Management_System/employee-management"
            element={<EmployeeManagementPage />}
          />
          <Route
            path="/Face_Attendance_Management_System/employee-management/editEmployeeDetails/:id/:deviceMac"
            element={<EditEmployeeDetailsPage />}
          />
          <Route
            path="/Face_Attendance_Management_System/attendance"
            element={<AttendancePage />}
          />
          <Route
            path="/Face_Attendance_Management_System/task-management"
            element={<TaskManagementPage />}
          />
          <Route
            path="/Face_Attendance_Management_System/leave-approval"
            element={<LeaveApprovalPage />}
          />
          <Route
            path="/Face_Attendance_Management_System/rules"
            element={<RulesPage />}
          />
          <Route
            path="/Face_Attendance_Management_System/pay-period"
            element={<PayPeriodPage />}
          />
          <Route path="*" element={<Animated404 />} />
        </Route>
        <Route
          path="/Face_Attendance_Management_System/verification"
          element={<EmailVerification />}
        />
      </Route>

      {/* Public routes */}
      <Route
        path="/Face_Attendance_Management_System/signin"
        element={<SignInPage />}
      />
    </Routes>
  );
};

export default AppRoutes;
