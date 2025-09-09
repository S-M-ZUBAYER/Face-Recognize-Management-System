import React from "react";
import { useLeaveData } from "@/hook/useLeaveData";

function LeaveSummary() {
  const { leaveCategoryArray, isLoading } = useLeaveData();

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <p className="text-gray-500">Loading leave summary...</p>
      </div>
    );
  }

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
