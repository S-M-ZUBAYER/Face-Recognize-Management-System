import { Route, Routes, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Animated404 from "../components/404";
import Dashboard from "../pages/Dashboard";
import SignInPage from "../pages/SignInPage";
import EmployeePage from "@/pages/EmployeePage";
import SalaryCalculationPage from "@/pages/SalaryCalculationPage";
import Warehouse from "@/components/salaryCalculation/test";
import DeviceManagementPage from "@/pages/DeviceManagementPage";
import AdminManagementPage from "@/pages/AdminManagementPage";
import EmployeeManagementPage from "@/pages/EmployeeManagementPage";
import AttendancePage from "@/pages/AttendancePage";

const AppLayout = () => {
  return (
    <div className="flex h-screen">
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
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="employee" element={<EmployeePage />} />
        <Route path="salary-calculation" element={<SalaryCalculationPage />} />
        {/* <Route path="attendance" element={<Warehouse />} /> */}
        <Route path="device-management" element={<DeviceManagementPage />} />
        <Route path="admin-management" element={<AdminManagementPage />} />
        <Route
          path="employee-management"
          element={<EmployeeManagementPage />}
        />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="*" element={<Animated404 />} />
      </Route>
      <Route path="/signin" element={<SignInPage />} />
    </Routes>
  );
};

export default AppRoutes;
