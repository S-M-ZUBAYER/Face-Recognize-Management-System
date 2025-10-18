// components/EmployeeAttendance.jsx - OPTIMIZED
import AttendanceTable from "./AttendanceTable";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployeeAttendanceData } from "@/hook/useEmployeeAttendanceData";
import { useEffect, useState } from "react";

const EmployeeAttendance = () => {
  const { isProcessing, refresh } = useEmployeeAttendanceData();
  const {
    allEmployees,
    presentEmployees,
    absentEmployees,
    overTimeEmployees,
    activeFilter,
  } = useAttendanceStore();

  const [displayedEmployees, setDisplayedEmployees] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Optimize filter switching with debounce
  useEffect(() => {
    const getFilteredEmployees = () => {
      switch (activeFilter) {
        case "present":
          return presentEmployees;
        case "absent":
          return absentEmployees;
        case "overtime":
          return overTimeEmployees;
        default:
          return allEmployees;
      }
    };

    // Debounce filter changes for better performance
    const timer = setTimeout(
      () => {
        const filtered = getFilteredEmployees();
        setDisplayedEmployees(filtered);
        setIsInitialLoad(false);
      },
      isInitialLoad ? 0 : 150
    );

    return () => clearTimeout(timer);
  }, [
    activeFilter,
    allEmployees,
    presentEmployees,
    absentEmployees,
    overTimeEmployees,
    isInitialLoad,
  ]);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="p-6 space-y-4">
      {isProcessing && isInitialLoad ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance data...</p>
            <p className="text-sm text-gray-500 mt-2">
              Processing {allEmployees.length} records
            </p>
          </div>
        </div>
      ) : (
        <AttendanceTable employees={displayedEmployees} />
      )}
    </div>
  );
};

export default EmployeeAttendance;
