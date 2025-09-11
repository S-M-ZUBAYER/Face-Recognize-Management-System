import { useEmployeeAttendanceData } from "@/hook/useEmployeeAttendanceData";
import AttendanceTable from "./AttendanceTable";

const EmployeeAttendance = () => {
  const { filterEmployees } = useEmployeeAttendanceData();

  return (
    <div className="p-6 space-y-4">
      <AttendanceTable employees={filterEmployees} />
    </div>
  );
};

export default EmployeeAttendance;
