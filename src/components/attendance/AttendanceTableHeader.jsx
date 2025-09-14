import { useMemo } from "react";

const AttendanceTableHeader = ({ employees }) => {
  // Calculate maximum punch count across all employees
  const maxPunchCount = useMemo(() => {
    if (!employees || employees.length === 0) return 1;

    let maxCount = 0;

    employees.forEach((employee) => {
      if (employee?.punch.checkIn) {
        if (Array.isArray(employee.punch.checkIn)) {
          // If punch is an array, get its length
          maxCount = Math.max(maxCount, employee.punch.checkIn.length);
        } else if (employee.punch.checkIn.length === 0) {
          // If punch is a string, count as 1
          maxCount = Math.max(maxCount, 1);
        }
      }
    });

    // Return at least 1 punch column even if no data
    return maxCount || 1;
  }, [employees]);

  // Generate punch headers based on max count
  const punchHeaders = useMemo(() => {
    return Array.from({ length: maxPunchCount }, (_, index) => (
      <th key={`punch-${index}`} className="text-left p-4 text-nowrap">
        {maxPunchCount === 1 ? "Punch" : `Punch ${index + 1}`}
      </th>
    ));
  }, [maxPunchCount]);

  return (
    <thead className="bg-[#E6ECF0]">
      <tr>
        <th className="sticky left-0 z-21 bg-[#E6ECF0] p-4">Select</th>
        <th className="sticky left-[1.5vw] z-20 bg-[#E6ECF0] p-4">Date</th>
        <th className="sticky left-[7.5vw] z-20 bg-[#E6ECF0] p-4">Name</th>
        <th className="p-4 text-nowrap">Employee ID</th>
        <th className="p-4">Designation</th>
        <th className="p-4">Department</th>
        {punchHeaders}
      </tr>
    </thead>
  );
};

export default AttendanceTableHeader;
