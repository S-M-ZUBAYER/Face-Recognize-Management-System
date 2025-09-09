import { useState, useMemo } from "react";
import AttendanceFilters from "./AttendanceFilters ";
import AttendanceTable from "./AttendanceTable";
import { useEmployeeData } from "@/hook/useEmployeeData";
import { useOverTimeData } from "@/hook/useOverTimeData";

const EmployeeAttendance = () => {
  const { attendedEmployees, absentEmployees } = useEmployeeData();
  const { overTime } = useOverTimeData();
  // console.log(attendedEmployees, absentEmployees);

  const [activeFilter, setActiveFilter] = useState("present");
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const getCurrentEmployees = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    switch (activeFilter) {
      case "present":
        return attendedEmployees;
      case "absent":
        return absentEmployees;
      case "all":
        return [...attendedEmployees, ...absentEmployees];
      case "overtime": {
        const allEmployees = [...attendedEmployees, ...absentEmployees];
        return allEmployees.filter((employee) =>
          overTime.some(
            (record) =>
              record.employeeId === employee.employeeId &&
              record.date.split("T")[0] === today
          )
        );
      }
      default:
        return [];
    }
  }, [activeFilter, attendedEmployees, absentEmployees, overTime]);

  const currentEmployees = getCurrentEmployees;

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
