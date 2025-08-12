import React from "react";

function LeaveSummary() {
  const leaves = [
    { no: "01", type: "Sick Leave", total: "10 persons" },
    { no: "02", type: "Casual Leave", total: "02 persons" },
    { no: "03", type: "Vacation Leave", total: "15 persons" },
    { no: "04", type: "Maternity Leave", total: "05 persons" },
    { no: "05", type: "Paternity Leave", total: "03 persons" },
    { no: "06", type: "Sabbatical Leave", total: "01 person" },
    { no: "07", type: "Unpaid Leave", total: "04 persons" },
    { no: "08", type: "Medical Leave", total: "08 persons" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-semibold text-lg mb-4">Leave Summary</h3>
      <table className="w-full text-sm text-left">
        <thead className="bg-[#E6ECF0] ">
          <tr className="text-gray-500 text-[14px]">
            <th className="pb-2 px-[10px] py-[10px] ">No.</th>
            <th className="pb-2 px-[10px] py-[10px]">Leave type</th>
            <th className="pb-2 px-[10px] py-[10px] ">Total</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((leave, idx) => (
            <tr key={idx} className="border-t text-gray-700">
              <td className="py-2 px-[10px]">{leave.no}</td>
              <td className="py-2">{leave.type}</td>
              <td className="py-2">{leave.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaveSummary;
