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

  // Async salary calculation - FIXED DEPENDENCIES
  useEffect(() => {
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
