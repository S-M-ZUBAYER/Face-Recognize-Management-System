import React, { useMemo, useCallback, useState, useEffect } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import FancyLoader from "@/components/FancyLoader";
import { useSalaryCalculationData } from "@/hook/useSalaryCalculationData";
import MonthPicker from "@/components/salaryCalculation/MonthPicker";
import { useDesignation } from "@/hook/useDesignation";
import SalaryTable from "@/components/salaryCalculation/SalaryTable";

function SalaryCalculationPage() {
  const [activeFilter, setActiveFilter] = React.useState("All Employees");
  const [showLoader, setShowLoader] = useState(true);

  const { isLoading, enrichedEmployees } = useSalaryCalculationData();
  const { designation, isLoading: designationLoading } = useDesignation();

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
  if (isLoading || designationLoading || showLoader) {
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
