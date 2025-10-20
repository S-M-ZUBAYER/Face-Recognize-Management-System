import React, { memo, useState } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";

import FancyLoader from "@/components/FancyLoader";
import { useSalaryCalculationData } from "@/hook/useSalaryCalculationData";
import MonthPicker from "@/components/salaryCalculation/MonthPicker";
import { useDesignation } from "@/hook/useDesignation";

import SalaryTable from "@/components/salaryCalculation/SalaryTable";

function SalaryCalculationPage() {
  const [activeFilter, setActiveFilter] = useState("All Employees");

  const { isLoading, enrichedEmployees } = useSalaryCalculationData();
  const { designation } = useDesignation();
  console.log(enrichedEmployees);

  const getFilteredEmployees = () => {
    if (activeFilter === "All Employees") return enrichedEmployees;
    return enrichedEmployees.filter((emp) => emp.department === activeFilter);
  };
  if (isLoading) {
    return <FancyLoader />;
  }

  return (
    <div className=" space-y-4 px-6 ">
      <div className="flex justify-between items-center ">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
          Salary calculation
        </p>
        <div className="flex items-center gap-4">
          <MonthPicker />
        </div>
      </div>
      <EmployeeFilterTabs
        filters={designation}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <SalaryTable employees={getFilteredEmployees()} />
    </div>
  );
}

export default memo(SalaryCalculationPage);
