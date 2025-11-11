import React, { useMemo, useCallback } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import FancyLoader from "@/components/FancyLoader";
import { useSalaryCalculationData } from "@/hook/useSalaryCalculationData";
import MonthPicker from "@/components/salaryCalculation/MonthPicker";
import { useDesignation } from "@/hook/useDesignation";
import SalaryTable from "@/components/salaryCalculation/SalaryTable";

function SalaryCalculationPage() {
  const [activeFilter, setActiveFilter] = React.useState("All Employees");

  const { isLoading, enrichedEmployees } = useSalaryCalculationData();
  const { designation } = useDesignation();

  console.log(enrichedEmployees);

  // Memoized filtered employees to prevent unnecessary recalculations
  const filteredEmployees = useMemo(() => {
    if (activeFilter === "All Employees") return enrichedEmployees;
    return enrichedEmployees.filter((emp) => emp.department === activeFilter);
  }, [activeFilter, enrichedEmployees]);

  // Memoized handler for filter changes
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  // Early return for loading state
  if (isLoading) {
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
