import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import EmployeeManagementTable from "@/components/employeeManagement/EmployeeManagementTable";
import React from "react";
import { useEmployeeData } from "@/hook/useEmployeeData";

function EmployeeManagementPage() {
  const { employees } = useEmployeeData();
  const [activeFilter, setActiveFilter] = React.useState("All Employees");

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
    if (activeFilter === "All Employees") return employees;
    return employees.filter((emp) => emp.department === activeFilter);
  };

  return (
    <>
      <div className="p-6 space-y-4">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
          Employee Management
        </p>
        <EmployeeFilterTabs
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <EmployeeManagementTable employees={getFilteredEmployees()} />
      </div>
    </>
  );
}

export default EmployeeManagementPage;
