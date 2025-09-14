import EmployeeAttendance from "@/components/attendance/EmployeeAttendance";
import { useEmployeeAttendanceData } from "@/hook/useEmployeeAttendanceData";
function AttendancePage() {
  useEmployeeAttendanceData();
  return (
    <>
      <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] text-start">
        Employee's Attendance
      </p>
      <EmployeeAttendance />
    </>
  );
}

export default AttendancePage;
