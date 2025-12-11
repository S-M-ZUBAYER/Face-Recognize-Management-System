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
import { useEmployees } from "@/hook/useEmployees";

const AppLayout = () => {
  useEmployees(); // Fetch and set employees data
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
