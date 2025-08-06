import React from "react";

function AttendanceCard({ title, count, icon }) {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl px-[22px] py-[36px] flex items-center justify-between">
      <div>
        <h2 className="text-[24px] font-bold">{count}</h2>
        <p className="text-gray-500 text-[14px]">{title}</p>
      </div>
      <div className="bg-gray-100 p-2 rounded-full">{icon}</div>
    </div>
  );
}

export default AttendanceCard;
