import React, { useState } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import EmployeeTable from "@/components/employee/EmployeeTable";
import FancyLoader from "@/components/FancyLoader";
import { useEmployees } from "@/hook/useEmployees";
import { useDesignation } from "../hook/useDesignation";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

function EmployeePage() {
  const [activeFilter, setActiveFilter] = useState("All Employees");
  const { isLoading: EmployeesLoading } = useEmployees();

  const { employees } = useEmployeeStore();

  console.log(employees());

  const { designation, isLoading: designationLoading } = useDesignation();

  const getFilteredEmployees = () => {
    if (activeFilter === "All Employees") return employees();
    return employees().filter((emp) => emp.department === activeFilter);
  };

  if (EmployeesLoading || designationLoading) {
    <FancyLoader />;
  }

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
      <EmployeeTable employees={getFilteredEmployees()} />
    </div>
  );
}

export default EmployeePage;
