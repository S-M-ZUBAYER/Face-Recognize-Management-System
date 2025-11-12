import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import EmployeeManagementTable from "@/components/employeeManagement/EmployeeManagementTable";
import React from "react";
import { useEmployees } from "@/hook/useEmployees";
import { useDesignation } from "@/hook/useDesignation";
import FancyLoader from "@/components/FancyLoader";

function EmployeeManagementPage() {
  const { Employees, isLoading } = useEmployees();
  const [activeFilter, setActiveFilter] = React.useState("All Employees");
  const { designation, isLoading: managementLoading } = useDesignation();

  // Filter Employees based on activeFilter
  const getFilteredEmployees = () => {
    if (activeFilter === "All Employees") return Employees;
    return Employees.filter((emp) => emp.department === activeFilter);
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
          Employee Management
        </p>
        {isLoading || managementLoading ? (
          <FancyLoader />
        ) : (
          <>
            <EmployeeFilterTabs
              filters={designation}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            <EmployeeManagementTable employees={getFilteredEmployees()} />
          </>
        )}
      </div>
    </>
  );
}

export default EmployeeManagementPage;
