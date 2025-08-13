import React, { useState } from "react";
import EmployeeFilterTabs from "@/components/employee/EmployeeFilterTabs";
import EmployeeTable from "@/components/employee/EmployeeTable";
import ExportButton from "@/components/employee/ExportButton";

function EmployeePage() {
  const [activeFilter, setActiveFilter] = useState("All Employees");

  const filters = [
    "All Employees",
    "Software Development",
    "Marketing",
    "Human Resources",
    "Sales",
    "Customer Support",
    "Finance",
    "Product Management",
  ];

  const employees = [
    {
      name: "Md Golam Rabbani Pias",
      empId: "TG0642",
      designation: "Product Designer",
      department: "Software Development",
      workHour: "8 Hours",
    },
    {
      name: "Anya Sharma",
      empId: "TG0715",
      designation: "Frontend Developer",
      department: "Software Development",
      workHour: "8 Hours",
    },
    {
      name: "Kenji Tanaka",
      empId: "TG0588",
      designation: "Backend Engineer",
      department: "Software Development",
      workHour: "8 Hours",
    },
  ];

  const handleExport = () => {
    alert("Exporting Excel...");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Employee List</h1>
      <EmployeeFilterTabs
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <EmployeeTable employees={employees} />
      <div className="flex justify-end">
        <ExportButton onExport={handleExport} />
      </div>
    </div>
  );
}

export default EmployeePage;
