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

const AppLayout = () => {
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
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="employee" element={<EmployeePage />} />
          <Route
            path="salary-calculation"
            element={<SalaryCalculationPage />}
          />
          {/* <Route path="attendance" element={<Warehouse />} /> */}
          <Route path="device-management" element={<DeviceManagementPage />} />
          <Route path="admin-management" element={<AdminManagementPage />} />
          <Route
            path="employee-management"
            element={<EmployeeManagementPage />}
          />
          <Route
            path="employee-management/editEmployeeDetails/:id/:deviceMac"
            element={<EditEmployeeDetailsPage />}
          />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="task-management" element={<TaskManagementPage />} />
          <Route path="leave-approval" element={<LeaveApprovalPage />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="*" element={<Animated404 />} />
        </Route>
      </Route>

      {/* Public routes */}
      <Route path="/signin" element={<SignInPage />} />
    </Routes>
  );
};

export default AppRoutes;
