import EmployeeAttendance from "@/components/attendance/EmployeeAttendance";
import { DatePicker } from "@/components/DatePicker";
import React from "react";
import DateRangePicker from "@/components/salaryCalculation/DateRangePicker";

function AttendancePage() {
  return (
    <>
      <div className="flex justify-between items-center px-6">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F] text-center">
          Employee’s Attendance
        </p>
        <div className="flex items-center gap-4">
          <DatePicker />
          <DateRangePicker />
        </div>
      </div>
      <EmployeeAttendance />
    </>
  );
}

export default AttendancePage;
