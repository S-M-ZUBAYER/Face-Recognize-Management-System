import React from "react";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

function LeaveSummary() {
  const { selectedDate } = useAttendanceStore();
  const [leaveCategoryArray, setLeaveCategoryArray] = React.useState([]);
  const { employees } = useEmployeeStore();

  React.useEffect(() => {
    setLeaveCategoryArray(getLeaveSummaryByDate(employees(), selectedDate));
  }, [employees, selectedDate]);

  if (!leaveCategoryArray || leaveCategoryArray.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <p className="text-gray-500">No leave records for today</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-semibold text-lg mb-4">Leave Summary</h3>

      <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-[#E6ECF0]">
          <tr className="text-gray-600 text-[14px]">
            <th className="px-4 py-2">No.</th>
            <th className="px-4 py-2">Leave Type</th>
            <th className="px-4 py-2">Total</th>
          </tr>
        </thead>

        <tbody>
          {leaveCategoryArray.map((leave, idx) => (
            <tr
              key={idx}
              className="border-t hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-2">{idx + 1}</td>
              <td className="px-4 py-2">{leave.category}</td>
              <td className="px-4 py-2 font-medium">{leave.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaveSummary;

const getLeaveSummaryByDate = (employees = [], date) => {
  const counterMap = new Map();

  employees.forEach((employee) => {
    const leaveTypes = getLeaveTypes(employee, date);

    leaveTypes.forEach((type) => {
      counterMap.set(type, (counterMap.get(type) || 0) + 1);
    });
  });

  return Array.from(counterMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));
};

const getLeaveTypes = (employee, date) => {
  const leaveTypes = [];
  const leaveMappings = {
    m_leaves: "Maternity leave",
    mar_leaves: "Marriage Leave",
    p_leaves: "Personal Leave",
    s_leaves: "Sick Leave",
    c_leaves: "Casual Leave",
    e_leaves: "Earned Leave",
    w_leaves: "Without Pay Leave",
    r_leaves: "Rest Leave",
    o_leaves: "Other Leave",
  };

  if (!employee.salaryRules) return leaveTypes;
  const dateOnly = date.split("T")[0];
  const generalDays = (employee.salaryRules.generalDays || []).map(
    (h) => h.split("T")[0],
  );

  if (generalDays.includes(dateOnly)) {
    return [];
  }

  Object.keys(leaveMappings).forEach((leaveKey) => {
    const leaves = employee.salaryRules[leaveKey];
    if (Array.isArray(leaves)) {
      const hasLeave = leaves.some((leave) => {
        const leaveDate = leave.date?.date || leave.date;
        return leaveDate?.toString().includes(date);
      });

      if (hasLeave) {
        leaveTypes.push(leaveMappings[leaveKey]);
      }
    }
  });
  return leaveTypes;
};
