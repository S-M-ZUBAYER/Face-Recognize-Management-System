import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";

const DateRangePicker = ({
  minDate = null,
  maxDate = null,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const {
    startDate,
    endDate,
    setDateRange,
    clearDateRange,
    getFormattedRange,
  } = useDateRangeStore();

  const formatDateForStore = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate || !date) return false;
    const dateStr = formatDateForStore(date);
    return dateStr >= startDate && dateStr <= endDate;
  };

  const isDateSelected = (date) => {
    if (!date) return false;
    const dateStr = formatDateForStore(date);
    return dateStr === startDate || dateStr === endDate;
  };

  const isDateDisabled = (date) => {
    if (!date) return false;
    const dateStr = formatDateForStore(date);

    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;

    return false;
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    const clickedDate = formatDateForStore(date);

    if (selectingStart) {
      setDateRange(clickedDate, null);
      setSelectingStart(false);
    } else {
      if (clickedDate < startDate) {
        // If end date is before start date, swap them
        setDateRange(clickedDate, startDate);
      } else {
        setDateRange(startDate, clickedDate);
      }
      setSelectingStart(true);
      setIsOpen(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleClear = () => {
    clearDateRange();
    setSelectingStart(true);
  };

  const getDisplayText = () => {
    const formatted = getFormattedRange();
    return formatted || "Select date range";
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-64"
        >
          <Calendar size={16} className="text-gray-500" />
          <span className="text-gray-700 flex-1 text-left">
            {getDisplayText()}
          </span>
        </button>

        {(startDate || endDate) && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Clear selection"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold text-gray-800">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-3 text-sm text-gray-600">
            {selectingStart ? "Select start date" : "Select end date"}
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => {
              if (!date) {
                return <div key={index} className="w-8 h-8" />;
              }

              const isSelected = isDateSelected(date);
              const isInRange = isDateInRange(date);
              const isDisabled = isDateDisabled(date);
              const isToday =
                formatDateForStore(date) === formatDateForStore(new Date());

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled}
                  className={`
                    w-8 h-8 text-sm rounded transition-colors
                    ${
                      isDisabled
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                    ${
                      isSelected
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : ""
                    }
                    ${
                      isInRange && !isSelected
                        ? "bg-blue-100 text-blue-700"
                        : ""
                    }
                    ${
                      isToday && !isSelected && !isInRange
                        ? "bg-gray-200 font-semibold"
                        : ""
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick Select Options */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-2">Quick select:</div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Last 7 days", days: 7 },
                { label: "Last 30 days", days: 30 },
                { label: "This month", days: "month" },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    const today = new Date();
                    let start, end;

                    if (option.days === "month") {
                      start = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                      );
                      end = new Date(
                        today.getFullYear(),
                        today.getMonth() + 1,
                        0
                      );
                    } else {
                      end = today;
                      start = new Date(today);
                      start.setDate(start.getDate() - option.days + 1);
                    }

                    setDateRange(
                      formatDateForStore(start),
                      formatDateForStore(end)
                    );
                    setSelectingStart(true);
                    setIsOpen(false);
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
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

export default DateRangePicker;
