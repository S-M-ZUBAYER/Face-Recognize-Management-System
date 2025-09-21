import EmployeeAttendance from "@/components/attendance/EmployeeAttendance";
function AttendancePage() {
  return (
    <>
      <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] text-start px-6">
        Employee's Attendance
      </p>
      <EmployeeAttendance />
    </>
  );
}

export default AttendancePage;
