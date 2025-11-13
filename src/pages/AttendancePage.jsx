import { useState, useEffect } from "react";
import EmployeeAttendance from "@/components/attendance/EmployeeAttendance";
import FancyLoader from "@/components/FancyLoader";

function AttendancePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show FancyLoader for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <FancyLoader />;
  }

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
