// import React, { useEffect, Suspense, lazy } from "react";
// import { useSalaryCalculationData } from "@/hook/useSalaryCalculationData";
// import FancyLoader from "@/components/FancyLoader";

// Lazy load the heavy EmployeeAttendance component
// const EmployeeAttendance = lazy(() =>
//   import("@/components/attendance/EmployeeAttendance")
// );

import EmployeeAttendance from "@/components/attendance/EmployeeAttendance";

function AttendancePage() {
  // const { refetchAttendance, isLoading } = useSalaryCalculationData();

  // useEffect(() => {
  //   refetchAttendance();
  // }, []);

  return (
    <>
      <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] text-start">
        Employee's Attendance
      </p>
      <EmployeeAttendance />
      {/* {isLoading ? (
        <FancyLoader />
      ) : (
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-8">
              <FancyLoader />
            </div>
          }
        >
          <EmployeeAttendance />
        </Suspense>
      )} */}
    </>
  );
}

export default AttendancePage;
