import EmployeeAttendance from "@/components/attendance/EmployeeAttendance";
import { DatePicker } from "@/components/DatePicker";
import React from "react";

function AttendancePage() {
  return (
    <>
      <div className="flex justify-between items-center px-6">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F] text-center">
          Employee’s Attendance
        </p>
        <DatePicker />
      </div>
      <EmployeeAttendance />
    </>
  );
}

export default AttendancePage;
