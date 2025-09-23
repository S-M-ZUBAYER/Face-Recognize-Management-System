import React, { useState } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import EmployeeTable from "@/components/employee/EmployeeTable";
import FancyLoader from "@/components/FancyLoader";
import { useEmployees } from "@/hook/useEmployees";
import { useDesignation } from "../hook/useDesignation";

function EmployeePage() {
  const [activeFilter, setActiveFilter] = useState("All Employees");
  const { Employees, isLoading } = useEmployees();

  console.log(Employees);

  const { designation } = useDesignation();

  const getFilteredEmployees = () => {
    if (activeFilter === "All Employees") return Employees;
    return Employees.filter((emp) => emp.department === activeFilter);
  };

  return (
    <div className="p-4 space-y-4">
      <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
        Employee List
      </p>
      <EmployeeFilterTabs
        filters={designation}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      {isLoading ? (
        <FancyLoader />
      ) : (
        <EmployeeTable employees={getFilteredEmployees()} />
      )}
    </div>
  );
}

export default EmployeePage;
