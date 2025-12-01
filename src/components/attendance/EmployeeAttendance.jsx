import { useEffect, useState, useRef } from "react";
import AttendanceTable from "./AttendanceTable";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useAttendanceData } from "@/hook/useAttendanceData";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useOverTimeData } from "@/hook/useOverTimeData";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";

const EmployeeAttendance = () => {
  // Get all data from hooks
  const { Attendance } = useAttendanceData();
  const { employees } = useEmployeeStore();
  const Employees = employees();
  const { startDate, endDate } = useDateRangeStore();
  const { overTime } = useOverTimeData();

  // Get store state and actions
  const {
    allEmployees,
    activeFilter,
    isProcessing,
    processAttendanceData,
    getFilteredEmployees,
  } = useAttendanceStore();

  // Local state for displayed employees
  const [displayedEmployees, setDisplayedEmployees] = useState([]);

  // Refs to track previous values and prevent infinite loops
  const processedRef = useRef(false);
  const prevDataRef = useRef({
    employees: null,
    attendance: null,
    overtime: null,
    startDate: null,
    endDate: null,
  });

  // Process data only when dependencies actually change
  useEffect(() => {
    // Skip if no employees or already processing
    if (!Employees?.length || isProcessing) return;

    const currentData = {
      employees: Employees,
      attendance: Attendance,
      overtime: overTime,
      startDate,
      endDate,
    };

    // Check if data has actually changed
    const hasDataChanged =
      JSON.stringify(currentData.employees) !==
        JSON.stringify(prevDataRef.current.employees) ||
      JSON.stringify(currentData.attendance) !==
        JSON.stringify(prevDataRef.current.attendance) ||
      JSON.stringify(currentData.overtime) !==
        JSON.stringify(prevDataRef.current.overtime) ||
      currentData.startDate !== prevDataRef.current.startDate ||
      currentData.endDate !== prevDataRef.current.endDate;

    if (hasDataChanged && !processedRef.current) {
      console.log("🔄 Data changed, processing attendance...");
      processedRef.current = true;

      processAttendanceData(
        Employees,
        Attendance || [],
        overTime || [],
        startDate,
        endDate
      );

      // Update previous data reference
      prevDataRef.current = currentData;
    }
  }, [
    Employees,
    Attendance,
    overTime,
    startDate,
    endDate,
    isProcessing,
    processAttendanceData,
  ]);

  // Reset processed flag when processing completes
  useEffect(() => {
    if (!isProcessing) {
      processedRef.current = false;
    }
  }, [isProcessing]);

  // Update displayed employees when filter or data changes
  useEffect(() => {
    const filtered = getFilteredEmployees();
    setDisplayedEmployees(filtered);
  }, [activeFilter, allEmployees, getFilteredEmployees]);

  // Show loading during processing
  if (isProcessing && allEmployees.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-center items-center h-[65vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!isProcessing && allEmployees.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-center items-center h-[65vh]">
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              No attendance data available
            </p>
            <p className="text-gray-400 text-sm">
              Please check your data sources
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <AttendanceTable employees={displayedEmployees} />
    </div>
  );
};

export default EmployeeAttendance;
