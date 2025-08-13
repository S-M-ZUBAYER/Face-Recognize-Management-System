import React, { useEffect, useState } from "react";
import EmployeeFilterTabs from "@/components/employee/EmployeeFilterTabs";
import EmployeeTable from "@/components/employee/EmployeeTable";
import { useEmployeeData } from "@/hook/useEmployeeData";

function EmployeePage() {
  const [activeFilter, setActiveFilter] = useState("All Employees");
  const { employees, fetchAllEmployeeData } = useEmployeeData();

  useEffect(() => {
    if (employees.length > 0) {
      fetchAllEmployeeData();
    }
  }, [employees, fetchAllEmployeeData]);

  const filters = [
    "All Employees",
    "Information Technology",
    "Marketing",
    "Research and Development",
    "E-commerce",
    "Customer Support",
    "Finance",
  ];

  // const employees = [
  //   {
  //     name: "Md Golam Rabbani Pias",
  //     empId: "TG0642",
  //     designation: "Product Designer",
  //     department: "Software Development",
  //     workHour: "8 Hours",
  //   },
  //   {
  //     name: "Anya Sharma",
  //     empId: "TG0715",
  //     designation: "Frontend Developer",
  //     department: "Software Development",
  //     workHour: "8 Hours",
  //   },
  //   {
  //     name: "Kenji Tanaka",
  //     empId: "TG0588",
  //     designation: "Backend Engineer",
  //     department: "Software Development",
  //     workHour: "8 Hours",
  //   },
  //   {
  //     name: "Md Rabbani",
  //     empId: "TG0642",
  //     designation: "Product Designer",
  //     department: "Marketing",
  //     workHour: "8 Hours",
  //   },
  //   {
  //     name: "Sharma Anya",
  //     empId: "TG0715",
  //     designation: "Frontend Developer",
  //     department: "Human Resources",
  //     workHour: "8 Hours",
  //   },
  //   {
  //     name: "Kenji Tanaka",
  //     empId: "TG0588",
  //     designation: "Backend Engineer",
  //     department: "Sales",
  //     workHour: "8 Hours",
  //   },
  // ];

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
      <EmployeeTable employees={getFilteredEmployees()} />
    </div>
  );
}

export default EmployeePage;
