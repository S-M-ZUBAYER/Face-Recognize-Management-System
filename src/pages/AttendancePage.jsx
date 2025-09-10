import React, { useEffect, Suspense, lazy } from "react";
import DateRangePicker from "@/components/attendance/DateRangePicker";
import { useSalaryCalculationData } from "@/hook/useSalaryCalculationData";
import FancyLoader from "@/components/FancyLoader";

// Lazy load the heavy EmployeeAttendance component
const EmployeeAttendance = lazy(() =>
  import("@/components/attendance/EmployeeAttendance")
);

function AttendancePage() {
  const { refetchAttendance, isLoading } = useSalaryCalculationData();

  useEffect(() => {
    refetchAttendance();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center px-6">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] text-center">
          Employee's Attendance
        </p>
        <div className="flex items-center gap-4">
          <DateRangePicker />
        </div>
      </div>

      {isLoading ? (
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
      )}
    </>
  );
}

export default AttendancePage;
