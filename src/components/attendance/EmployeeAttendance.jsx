import { useEffect, useMemo } from "react";
import AttendanceTable from "./AttendanceTable";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useAttendanceData } from "@/hook/useAttendanceData";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useOverTimeData } from "@/hook/useOverTimeData";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";
import {
  getAttendanceRows,
  getFilteredEmployees,
} from "@/utils/attendance/processAttendanceData";

const EmployeeAttendance = () => {
  // Get all data from hooks
  const { Attendance, isLoading: attendanceLoading } = useAttendanceData();
  const { employees } = useEmployeeStore();
  const Employees = employees();
  const { startDate, endDate } = useDateRangeStore();
  const { overTime, isLoading: overTimeLoading } = useOverTimeData();
  const activeFilter = useAttendanceStore((state) => state.activeFilter);
  const setAttendanceSummary = useAttendanceStore(
    (state) => state.setAttendanceSummary,
  );

  const attendanceRows = useMemo(() => {
    if (!Employees?.length) {
      return {
        allEmployees: [],
        punchData: [],
        presentEmployees: [],
        absentEmployees: [],
        lateEmployees: [],
        overTimeEmployees: [],
      };
    }

    return getAttendanceRows({
      employees: Employees,
      attendance: Attendance,
      overtime: overTime,
      startDate,
      endDate,
    });
  }, [Employees, Attendance, overTime, startDate, endDate]);

  const allEmployees = attendanceRows.allEmployees;
  const displayedEmployees = useMemo(
    () => getFilteredEmployees(attendanceRows, activeFilter),
    [attendanceRows, activeFilter],
  );
  const isProcessing = attendanceLoading || overTimeLoading;

  useEffect(() => {
    setAttendanceSummary({
      totalCount: allEmployees.length,
      presentCount: attendanceRows.presentEmployees.length,
      absentCount: attendanceRows.absentEmployees.length,
      lateCount: attendanceRows.lateEmployees.length,
      isProcessing,
    });
  }, [allEmployees.length, attendanceRows, isProcessing, setAttendanceSummary]);

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
