import React, { useState } from "react";
import { useDateStore } from "@/zustand/useDateStore";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
const TaskMonthPicker = ({
  minYear = 2000,
  maxYear = 2030,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get state and actions from Zustand store
  const { TaskSelectedMonth, TaskSelectedYear, TaskSetMonth, TaskSetYear } =
    useDateStore();
  const [viewYear, setViewYear] = useState(TaskSelectedYear);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleMonthSelect = (monthIndex) => {
    // Update Zustand store
    TaskSetMonth(monthIndex); // 0-11
    TaskSetYear(viewYear);

    // Console log for debugging
    console.log("Selected:", { month: monthIndex + 1, year: viewYear }); // 1-12 for readability

    setIsOpen(false);
  };

  const handleYearChange = (direction) => {
    const newYear = viewYear + direction;
    if (newYear >= minYear && newYear <= maxYear) {
      setViewYear(newYear);
    }
  };

  const formatDisplayValue = () => {
    return `${months[TaskSelectedMonth]} ${TaskSelectedYear}`;
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <Calendar size={16} className="text-gray-500" />
        <span className="text-gray-700">{formatDisplayValue()}</span>
        <ChevronRight
          size={16}
          className={`text-gray-500 transform transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 min-w-64">
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleYearChange(-1)}
              disabled={viewYear <= minYear}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold text-gray-800">{viewYear}</h3>
            <button
              onClick={() => handleYearChange(1)}
              disabled={viewYear >= maxYear}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Months Grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => {
              const isSelected =
                TaskSelectedMonth === index && TaskSelectedYear === viewYear;
              return (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default TaskMonthPicker;
