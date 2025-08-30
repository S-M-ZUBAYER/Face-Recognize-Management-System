import React, { useState } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";

import FancyLoader from "@/components/FancyLoader";
import SalaryTable from "@/components/salaryCalculation/SalaryTable";
import { useSalaryCalculationData } from "@/hook/useSalaryCalculationData";

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
      <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
        Salary calculation
      </p>
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
