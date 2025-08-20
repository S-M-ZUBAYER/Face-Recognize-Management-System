import { useState } from "react";
import AttendanceFilters from "./AttendanceFilters ";
import AttendanceTable from "./AttendanceTable";
import { useEmployeeData } from "@/hook/useEmployeeData";

const EmployeeAttendance = () => {
  const { attendedEmployees, absentEmployees } = useEmployeeData();

  const [activeFilter, setActiveFilter] = useState("present");
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const getCurrentEmployees = () => {
    switch (activeFilter) {
      case "present":
        return attendedEmployees;
      case "absent":
        return absentEmployees;
      default:
        return [];
    }
  };

  const currentEmployees = getCurrentEmployees();

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(currentEmployees.map((emp) => emp.employeeId));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  // Filter change handler
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setSelectedEmployees([]);
  };

  return (
    <div className="p-6 space-y-4">
      <AttendanceFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        attendedCount={attendedEmployees.length}
        absentCount={absentEmployees.length}
      />

      <AttendanceTable
        employees={currentEmployees}
        selectedEmployees={selectedEmployees}
        onSelectAll={handleSelectAll}
        onSelectEmployee={handleSelectEmployee}
        showOvertime={activeFilter !== "absent"}
      />
    </div>
  );
};

export default EmployeeAttendance;
