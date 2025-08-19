const AttendanceFilters = ({
  activeFilter,
  onFilterChange,
  attendedCount,
  absentCount,
}) => {
  const filters = [
    { key: "present", label: "Present", count: attendedCount },
    { key: "absent", label: "Absent", count: absentCount },
    { key: "overtime", label: "Overtime", count: null },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === filter.key
              ? "bg-[#004368] text-[#E6ECF0] "
              : "bg-white text-[#B0C5D0] hover:bg-gray-100 border border-[#B0C5D0] "
          }`}
        >
          {filter.label}
          {filter.count !== null && (
            <span className="ml-1">({filter.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default AttendanceFilters;
