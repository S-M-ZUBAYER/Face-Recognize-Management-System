import React, { useMemo, useCallback, useState, useEffect, memo } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import FancyLoader from "@/components/FancyLoader";
import MonthPicker from "@/components/salaryCalculation/MonthPicker";
import SalaryTable from "@/components/salaryCalculation/SalaryTable";
import { useDesignation } from "@/hook/useDesignation";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useDateStore } from "@/zustand/useDateStore";
import { useAttendanceData } from "@/hook/useAttendanceData";
import { usePaymentInfo } from "@/hook/useSubscriptionData";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";
import { calculateSalaryDataAsync } from "@/lib/calculateSalaryData";

// Constants
const ALL_EMPLOYEES = "All Employees";

// Memoized Components
const PageHeader = memo(() => (
  <div className="flex justify-between items-center">
    <h1 className="text-[22px] font-semibold text-[#1F1F1F]">
      Salary Calculation
    </h1>
    <MonthPicker />
  </div>
));
PageHeader.displayName = "PageHeader";

const SubscriptionPrompt = memo(({ onUpgrade }) => (
  <div className="w-full h-[60vh] flex justify-center items-center">
    <div className="w-[50%] bg-white border border-[#E5E9EB] rounded-2xl shadow-md px-8 py-10 flex flex-col items-center gap-6">
      <h2 className="text-2xl font-semibold text-[#004368]">
        Subscription Required
      </h2>
      <p className="text-gray-600 text-center leading-relaxed">
        To access the Salary Calculation feature, please subscribe to a plan
        that includes this feature.
      </p>
      <button
        onClick={onUpgrade}
        className="mt-2 px-6 py-3 bg-[#004368] hover:bg-[#00324d] text-white font-medium rounded-xl shadow-sm transition-all duration-300"
      >
        Upgrade to Pro
      </button>
    </div>
  </div>
));
SubscriptionPrompt.displayName = "SubscriptionPrompt";

// Custom Hooks
const useSubscriptionStatus = (paymentInfo) => {
  return useMemo(() => {
    if (!paymentInfo?.paymentExpireTime)
      return { isExpired: true, isActive: false };

    const expireDate = new Date(paymentInfo.paymentExpireTime);
    const today = new Date();

    expireDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const isExpired = expireDate < today;
    return { isExpired, isActive: !isExpired };
  }, [paymentInfo]);
};

const useSalaryCalculation = (
  employees,
  attendance,
  selectedMonth,
  selectedYear,
  isSubscriptionActive,
) => {
  const [enrichedEmployees, setEnrichedEmployees] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!isSubscriptionActive || !employees.length || !attendance.length)
      return;

    const calculateSalaries = async () => {
      setIsCalculating(true);
      try {
        const results = await calculateSalaryDataAsync(
          employees,
          attendance,
          selectedMonth,
          selectedYear,
        );
        setEnrichedEmployees(results);
      } catch (error) {
        console.error("Salary calculation error:", error);
        setEnrichedEmployees([]);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateSalaries();
  }, [
    employees.length,
    attendance.length,
    selectedMonth,
    selectedYear,
    isSubscriptionActive,
  ]);

  return { enrichedEmployees, isCalculating };
};

// Main Component
function SalaryCalculationPage() {
  const [activeFilter, setActiveFilter] = useState(ALL_EMPLOYEES);

  // Store hooks
  const { employees } = useEmployeeStore();
  const { selectedMonth, selectedYear } = useDateStore();
  const { setIsSubscriptionModal } = useSubscriptionStore();

  // Data hooks
  const Employees = employees();
  const { isLoading: attendanceLoading, Attendance = [] } = useAttendanceData();
  const { designation, isLoading: designationLoading } = useDesignation();
  const { data: paymentInfo } = usePaymentInfo();

  // Custom hooks
  const { isExpired, isActive } = useSubscriptionStatus(paymentInfo);
  const { enrichedEmployees, isCalculating } = useSalaryCalculation(
    Employees,
    Attendance,
    selectedMonth,
    selectedYear,
    isActive,
  );

  // Memoized values
  const filteredEmployees = useMemo(() => {
    if (activeFilter === ALL_EMPLOYEES) return enrichedEmployees;
    return enrichedEmployees.filter((emp) => emp.department === activeFilter);
  }, [activeFilter, enrichedEmployees]);

  const isLoading = attendanceLoading || designationLoading || isCalculating;

  // Event handlers
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  const handleUpgrade = useCallback(() => {
    setIsSubscriptionModal(true);
  }, [setIsSubscriptionModal]);

  // Render conditions
  if (isLoading) return <FancyLoader />;
  if (isExpired) return <SubscriptionPrompt onUpgrade={handleUpgrade} />;

  return (
    <div className="space-y-4 px-6">
      <PageHeader />
      <EmployeeFilterTabs
        filters={designation}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />
      <SalaryTable employees={filteredEmployees} />
    </div>
  );
}

export default memo(SalaryCalculationPage);
