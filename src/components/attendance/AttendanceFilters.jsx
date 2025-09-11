import { memo } from "react";
import { useEmployeeAttendanceData } from "@/hook/useEmployeeAttendanceData";

const AttendanceFilters = () => {
  const {
    absentCount,
    presentCount,
    totalCount,
    activeFilter,
    setActiveFilter,
  } = useEmployeeAttendanceData();

  const filters = [
    { key: "all", label: "All", count: totalCount },
    { key: "present", label: "Present", count: presentCount },
    { key: "absent", label: "Absent", count: absentCount },
    { key: "overtime", label: "Overtime", count: null },
  ];

  console.log("AttendanceFilters re-rendered");

  return (
    <div className="flex flex-col gap-3.5">
      <p className="text-[#1F1F1F] text-[1vw] font-[600] font-poppins-regular">
        Choose Search Type
      </p>
      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? "bg-[#004368] text-[#E6ECF0]"
                : "bg-transparent text-[#B0C5D0] border border-[#B0C5D0]"
            }`}
          >
            {filter.label}
            {filter.count !== null && (
              <span className="ml-1">({filter.count})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(AttendanceFilters);
