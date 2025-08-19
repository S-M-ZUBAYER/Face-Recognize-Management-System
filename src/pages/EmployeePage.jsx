import React, { useEffect, useState } from "react";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import EmployeeTable from "@/components/employee/EmployeeTable";
import { useEmployeeData } from "@/hook/useEmployeeData";
import FancyLoader from "@/components/FancyLoader";

function EmployeePage() {
  const [activeFilter, setActiveFilter] = useState("All Employees");
  const { employees, fetchEmployees } = useEmployeeData();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (employees.length === 0) {
      const loadEmployees = async () => {
        setIsLoading(true);
        try {
          await fetchEmployees();
        } finally {
          setIsLoading(false);
        }
      };
      loadEmployees();
    }
  }, [employees, fetchEmployees]);

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
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-[600]">Employee List</h1>
      <EmployeeFilterTabs
        filters={filters}
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
