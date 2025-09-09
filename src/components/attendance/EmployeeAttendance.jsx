import { useState, useMemo } from "react";
import AttendanceFilters from "./AttendanceFilters ";
import AttendanceTable from "./AttendanceTable";
import { useEmployeeData } from "@/hook/useEmployeeData";
import { useOverTimeData } from "@/hook/useOverTimeData";
import { useEmployeeAttendanceData } from "@/hook/useEmployeeAttendanceData";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";

const EmployeeAttendance = () => {
  const { attendedEmployees, absentEmployees } = useEmployeeData();
  const { overTime } = useOverTimeData();
  const employeeAttendanceData = useEmployeeAttendanceData();
  const { startDate, endDate } = useDateRangeStore();

  const [activeFilter, setActiveFilter] = useState("present");

  // Check if date range is selected
  const isDateRangeMode = startDate && endDate;

  const getCurrentEmployees = useMemo(() => {
    if (isDateRangeMode) {
      return employeeAttendanceData;
    }

    // Normal mode - filter by attendance status
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
  }, [
    activeFilter,
    attendedEmployees,
    absentEmployees,
    overTime,
    employeeAttendanceData,
    isDateRangeMode,
  ]);

  const currentEmployees = getCurrentEmployees;

  // Filter change handler (disabled in date range mode)
  const handleFilterChange = (filter) => {
    if (isDateRangeMode) return; // Prevent filter changes in date range mode

    setActiveFilter(filter);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Hide AttendanceFilters when date range is selected */}
      {!isDateRangeMode && (
        <AttendanceFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          attendedCount={attendedEmployees.length}
          absentCount={absentEmployees.length}
        />
      )}

      {/* Show date range info when in date range mode */}
      {isDateRangeMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Date Range View
              </h3>
              <p className="text-sm text-blue-600">
                Showing attendance data from {startDate} to {endDate}
              </p>
            </div>
            <div className="text-sm text-blue-600">
              {currentEmployees.length} employees found
            </div>
          </div>
        </div>
      )}

      <AttendanceTable
        employees={currentEmployees}
        isDateRangeMode={isDateRangeMode}
      />
    </div>
  );
};

export default EmployeeAttendance;
