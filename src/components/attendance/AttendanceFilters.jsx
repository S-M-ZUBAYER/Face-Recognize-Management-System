// components/AttendanceFilters.jsx - FIXED VERSION
import { memo, useCallback, useMemo } from "react";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";

const AttendanceFilters = memo(() => {
  // Simple subscription without custom equality function to avoid infinite loops
  const activeFilter = useAttendanceStore((state) => state.activeFilter);
  const totalCount = useAttendanceStore((state) => state.totalCount);
  const presentCount = useAttendanceStore((state) => state.presentCount);
  const absentCount = useAttendanceStore((state) => state.absentCount);
  const isFilterLoading = useAttendanceStore((state) => state.isFilterLoading);
  const setActiveFilter = useAttendanceStore((state) => state.setActiveFilter);

  // Memoize filters array to prevent recreation
  const filters = useMemo(
    () => [
      { key: "punchData", label: "Original Attendance", count: totalCount },
      { key: "all", label: "All Records", count: totalCount },
      { key: "present", label: "Present", count: presentCount },
      { key: "absent", label: "Absent", count: absentCount },
      { key: "overtime", label: "Overtime", count: null },
    ],
    [totalCount, presentCount, absentCount]
  );

  // Memoize click handler
  const handleFilterClick = useCallback(
    (filterKey) => {
      if (filterKey !== activeFilter && !isFilterLoading) {
        setActiveFilter(filterKey);
      }
    },
    [activeFilter, isFilterLoading, setActiveFilter]
  );

  // console.log("AttendanceFilters re-rendered", {
  //   activeFilter,
  //   totalCount,
  //   presentCount,
  //   absentCount,
  //   isFilterLoading,
  // });

  return (
    <div className="flex flex-col gap-3.5">
      <p className="text-[#1F1F1F] text-[1vw] font-[600] font-poppins-regular">
        Choose Search Type
      </p>
      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => handleFilterClick(filter.key)}
            disabled={isFilterLoading}
            className={`px-2 py-1 rounded-full text-sm font-medium transition-colors relative md:px-4 md:py-2 whitespace-nowrap ${
              activeFilter === filter.key
                ? "bg-[#004368] text-[#E6ECF0]"
                : "bg-transparent text-[#B0C5D0] border border-[#B0C5D0]"
            } ${
              isFilterLoading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-[#004368] hover:text-[#E6ECF0]"
            }`}
          >
            {/* Show loading spinner when switching to this filter */}
            {isFilterLoading && activeFilter === filter.key && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              </div>
            )}

            {/* Filter content */}
            <span
              className={
                isFilterLoading && activeFilter === filter.key
                  ? "opacity-0 text-[0.7vw] "
                  : "opacity-100 text-[0.7vw] "
              }
            >
              {filter.label}
              {filter.count !== null && (
                <span className="ml-1">({filter.count})</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});

AttendanceFilters.displayName = "AttendanceFilters";

export default AttendanceFilters;
