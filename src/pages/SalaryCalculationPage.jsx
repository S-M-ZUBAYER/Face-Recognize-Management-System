import React, { useMemo, useCallback, useState, useEffect } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import FancyLoader from "@/components/FancyLoader";
import MonthPicker from "@/components/salaryCalculation/MonthPicker";
import { useDesignation } from "@/hook/useDesignation";
import SalaryTable from "@/components/salaryCalculation/SalaryTable";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useDateStore } from "@/zustand/useDateStore";
import { useAttendanceData } from "@/hook/useAttendanceData";
import { calculateSalaryDataAsync } from "@/lib/calculateSalaryData";
import { usePaymentInfo } from "@/hook/useSubscriptionData";
import { useUserData } from "@/hook/useUserData";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";

function SalaryCalculationPage() {
  const [activeFilter, setActiveFilter] = React.useState("All Employees");
  const [showLoader, setShowLoader] = useState(true);
  const [enrichedEmployees, setEnrichedEmployees] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const { employees } = useEmployeeStore();
  const Employees = employees();
  const { selectedMonth, selectedYear } = useDateStore();
  const { isLoading: attendanceLoading, Attendance = [] } = useAttendanceData();
  const { designation, isLoading: designationLoading } = useDesignation();
  const { user } = useUserData();
  const { data: paymentInfo } = usePaymentInfo(user?.userEmail);
  const { setIsSubscriptionModal } = useSubscriptionStore();

  // Async salary calculation - FIXED DEPENDENCIES
  useEffect(() => {
    if (!paymentInfo || paymentInfo.paymentStatus !== 1) return;
    const calculateSalaries = async () => {
      // Check if we have data and not already calculating
      if (Attendance.length > 0 && Employees.length > 0 && !isCalculating) {
        setIsCalculating(true);
        try {
          const results = await calculateSalaryDataAsync(
            Employees,
            Attendance,
            selectedMonth,
            selectedYear
          );
          setEnrichedEmployees(results);
        } catch (error) {
          console.error("Salary calculation error:", error);
          setEnrichedEmployees([]);
        } finally {
          setIsCalculating(false);
        }
      }
    };

    calculateSalaries();
    // Only depend on the actual values that should trigger recalculation
  }, [Attendance.length, Employees.length, selectedMonth, selectedYear]);

  // Show loader for minimum 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const filteredEmployees = useMemo(() => {
    if (activeFilter === "All Employees") return enrichedEmployees;
    return enrichedEmployees.filter((emp) => emp.department === activeFilter);
  }, [activeFilter, enrichedEmployees]);

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  // Show loader if still loading OR if we're in the 2-second delay period
  const shouldShowLoader =
    attendanceLoading || designationLoading || showLoader || isCalculating;

  if (shouldShowLoader) {
    return <FancyLoader />;
  }

  if (paymentInfo?.paymentStatus !== 1) {
    return (
      <div className="w-full h-[60vh] flex justify-center items-center">
        <div className="w-[50%] bg-white border border-[#E5E9EB] rounded-2xl shadow-md px-8 py-10 flex flex-col items-center gap-6">
          <p className="text-2xl font-semibold text-[#004368]">
            Subscription Required
          </p>

          <p className="text-gray-600 text-center leading-relaxed">
            To access the Salary Calculation feature, please subscribe to a plan
            that includes this feature.
          </p>

          <button
            onClick={() => setIsSubscriptionModal(true)}
            className="
        mt-2
        px-6 py-3
        bg-[#004368]
        hover:bg-[#00324d]
        text-white
        font-medium
        rounded-xl
        shadow-sm
        transition-all
        duration-300
        flex items-center gap-2
      "
          >
            <span className="text-white">Upgrade to Pro</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-6">
      <div className="flex justify-between items-center">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F]">
          Salary Calculation
        </p>
        <div className="flex items-center gap-4">
          <MonthPicker />
        </div>
      </div>

      <EmployeeFilterTabs
        filters={designation}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      <SalaryTable employees={filteredEmployees} />
    </div>
  );
}

export default React.memo(SalaryCalculationPage);
