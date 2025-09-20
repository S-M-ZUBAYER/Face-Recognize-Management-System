import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import EmployeeManagementTable from "@/components/employeeManagement/EmployeeManagementTable";
import React from "react";
import { useEmployees } from "@/hook/useEmployees";
import { useDesignation } from "@/hook/useDesignation";

function EmployeeManagementPage() {
  const { Employees } = useEmployees();
  const [activeFilter, setActiveFilter] = React.useState("All Employees");
  const { designation } = useDesignation();

  // const filters = [
  //   "All Employees",
  //   "Information Technology",
  //   "Marketing",
  //   "Research and Development",
  //   "E-commerce",
  //   "Customer Support",
  //   "Finance",
  // ];

  // Filter Employees based on activeFilter
  const getFilteredEmployees = () => {
    if (activeFilter === "All Employees") return Employees;
    return Employees.filter((emp) => emp.department === activeFilter);
  };

  return (
    <>
      <div className="p-6 space-y-4">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
          Employee Management
        </p>
        <EmployeeFilterTabs
          filters={designation}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <EmployeeManagementTable employees={getFilteredEmployees()} />
      </div>
    </>
  );
}

export default EmployeeManagementPage;
