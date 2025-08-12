import React from "react";
import image from "@/constants/image";

function EmployeeFilterTabs({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter, index) => (
        <button
          key={index}
          className={`px-6 py-4 rounded-full border border-[#B0C5D0] leading-2.5 font-[550] text-[18px] whitespace-nowrap ${
            activeFilter === filter
              ? "bg-[#004368] text-[#E6ECF0]  "
              : "bg-white text-[#B0C5D0] "
          }`}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
      <img
        src={image.horizontal}
        alt="cc"
        className=" border rounded-full px-4"
      />
    </div>
  );
}

export default EmployeeFilterTabs;
