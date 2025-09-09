import React, { useState } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";

import FancyLoader from "@/components/FancyLoader";
import SalaryTable from "@/components/salaryCalculation/SalaryTable";
import { useSalaryCalculationData } from "@/hook/useSalaryCalculationData";
import MonthPicker from "@/components/salaryCalculation/MonthPicker";
import DateRangePicker from "@/components/salaryCalculation/DateRangePicker";

function SalaryCalculationPage() {
  const [activeFilter, setActiveFilter] = useState("All Employees");

  const { isLoading, enrichedEmployees } = useSalaryCalculationData();
  console.log(enrichedEmployees);

  const filters = [
    "All Employees",
    "Information Technology",
    "Marketing",
    "Research and Development",
    "E-commerce",
    "Customer Support",
    "Finance",
  ];

  // Filter employees based on activeFilter
  const getFilteredEmployees = () => {
    if (activeFilter === "All Employees") return enrichedEmployees;
    return enrichedEmployees.filter((emp) => emp.department === activeFilter);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center px-6">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
          Salary calculation
        </p>
        <div className="flex items-center gap-4">
          <MonthPicker />
        </div>
      </div>
      <EmployeeFilterTabs
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      {isLoading ? (
        <FancyLoader />
      ) : (
        <SalaryTable employees={getFilteredEmployees()} />
      )}
    </div>
  );
}

export default SalaryCalculationPage;
