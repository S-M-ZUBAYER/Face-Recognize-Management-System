import { useState, useMemo, memo, lazy, Suspense } from "react";
import { useOverTimeData } from "@/hook/useOverTimeData";
import { useEmployeeAttendanceData } from "@/hook/useEmployeeAttendanceData";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";

// Lazy load components
const AttendanceFilters = lazy(() => import("./AttendanceFilters"));
const AttendanceTable = lazy(() => import("./AttendanceTable"));

// Loading components
const FiltersSkeleton = memo(() => (
  <div className="flex gap-2 p-4 bg-gray-50 rounded-lg animate-pulse">
    <div className="h-10 w-20 bg-gray-200 rounded"></div>
    <div className="h-10 w-20 bg-gray-200 rounded"></div>
    <div className="h-10 w-20 bg-gray-200 rounded"></div>
    <div className="h-10 w-24 bg-gray-200 rounded"></div>
  </div>
));

const TableSkeleton = memo(() => (
  <div className="space-y-2">
    <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
    ))}
  </div>
));

const EmployeeAttendance = () => {
  // Hooks
  const { overTime } = useOverTimeData();
  const { present, absent, total, presentCount, absentCount, totalCount } =
    useEmployeeAttendanceData();
  const { startDate, endDate } = useDateRangeStore();

  // Local state
  const [activeFilter, setActiveFilter] = useState("present");

  // Handlers
  const handleFilterChange = (filter) => setActiveFilter(filter);

  // Memoized values
  const isDateRangeMode = useMemo(
    () => Boolean(startDate && endDate),
    [startDate, endDate]
  );

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Compute employees for current filter
  const currentEmployees = useMemo(() => {
    switch (activeFilter) {
      case "present":
        return present;
      case "absent":
        return absent;
      case "all":
        return total;
      case "overtime": {
        const overtimeEmployeeIds = new Set(
          overTime
            .filter((record) => record.date.split("T")[0] === today)
            .map((record) => record.employeeId)
        );
        return total.filter((employee) =>
          overtimeEmployeeIds.has(employee.employeeId)
        );
      }
      default:
        return [];
    }
  }, [activeFilter, present, absent, total, overTime, today]);

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <Suspense fallback={<FiltersSkeleton />}>
        <AttendanceFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          attendedCount={presentCount}
          absentCount={absentCount}
          totalCount={totalCount}
        />
      </Suspense>

      {/* Attendance table */}
      <Suspense fallback={<TableSkeleton />}>
        <AttendanceTable
          employees={currentEmployees}
          isDateRangeMode={isDateRangeMode}
        />
      </Suspense>
    </div>
  );
};

export default EmployeeAttendance;
