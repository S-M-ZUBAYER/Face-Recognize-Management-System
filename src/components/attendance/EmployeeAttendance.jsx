import AttendanceTable from "./AttendanceTable";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployeeAttendanceData } from "@/hook/useEmployeeAttendanceData";
import { useEmployees } from "@/hook/useEmployees";
import { useAttendanceData } from "@/hook/useAttendanceData";

const EmployeeAttendance = () => {
  const { isProcessing } = useEmployeeAttendanceData();
  const {
    allEmployees,
    presentEmployees,
    absentEmployees,
    overTimeEmployees,
    activeFilter,
  } = useAttendanceStore();
  const { employees } = useEmployees();
  const { Attendance } = useAttendanceData();
  console.log(employees, Attendance);

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
  const filteredEmployees = getFilteredEmployees();
  console.log(filteredEmployees);

  return (
    <div className="p-6 space-y-4">
      {isProcessing ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Processing attendance data...</p>
        </div>
      ) : (
        <AttendanceTable employees={filteredEmployees} />
      )}
    </div>
  );
};

export default EmployeeAttendance;
