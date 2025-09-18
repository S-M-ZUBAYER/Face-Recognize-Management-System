import React, { useState, useMemo, useCallback, memo } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";

const DateRangePicker = ({
  minDate = null,
  maxDate = null,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const { startDate, endDate, setDateRange } = useDateRangeStore();

  // Memoize date formatting function
  const formatDateForStore = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Memoize today's date string - this will be our max date
  const todayStr = useMemo(
    () => formatDateForStore(new Date()),
    [formatDateForStore]
  );

  // Memoize months array
  const months = useMemo(
    () => [
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
    ],
    []
  );

  // Memoize days in current month with all their properties
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, key: `empty-${i}` });
    }

    // Add days of the month with pre-computed properties
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateForStore(date);

      // Pre-compute all properties
      const isSelected = dateStr === startDate || dateStr === endDate;
      const isInRange =
        startDate && endDate && dateStr >= startDate && dateStr <= endDate;

      // Check if date is disabled (including future dates)
      const isDisabled =
        (minDate && dateStr < minDate) ||
        (maxDate && dateStr > maxDate) ||
        dateStr > todayStr; // Block future dates

      const isToday = dateStr === todayStr;

      days.push({
        date,
        dateStr,
        day,
        isSelected,
        isInRange,
        isDisabled,
        isToday,
        key: `day-${day}`,
      });
    }

    return days;
  }, [
    currentMonth,
    startDate,
    endDate,
    minDate,
    maxDate,
    formatDateForStore,
    todayStr,
  ]);

  // Optimized click handler
  const handleDateClick = useCallback(
    (dayData) => {
      if (dayData.isDisabled) return;

      const clickedDate = dayData.dateStr;

      if (selectingStart) {
        setDateRange(clickedDate, null);
        setSelectingStart(false);
      } else {
        if (clickedDate < startDate) {
          setDateRange(clickedDate, startDate);
        } else {
          setDateRange(startDate, clickedDate);
        }
        setSelectingStart(true);
        setIsOpen(false);
      }
    },
    [selectingStart, startDate, setDateRange]
  );

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1
    );
    const today = new Date();

    // Don't allow navigation to months that are entirely in the future
    // Allow navigation to current month or any month that has at least one past/present date
    if (
      nextMonth.getFullYear() > today.getFullYear() ||
      (nextMonth.getFullYear() === today.getFullYear() &&
        nextMonth.getMonth() > today.getMonth())
    ) {
      return; // Don't navigate to future months
    }

    setCurrentMonth(nextMonth);
  }, [currentMonth]);

  // const handleClear = useCallback(() => {
  //   clearDateRange();
  //   setSelectingStart(true);
  // }, [clearDateRange]);

  // Create reactive formatted range
  const getFormattedRange = useCallback(() => {
    if (!startDate && !endDate) return null;

    const formatDate = (dateStr) => {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    if (startDate && !endDate) return formatDate(startDate);
    if (!startDate && endDate) return formatDate(endDate);
    if (startDate === endDate) return formatDate(startDate);

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }, [startDate, endDate]);

  // Memoize display text
  const displayText = useMemo(() => {
    return getFormattedRange() || new Date().toISOString().split("T")[0];
  }, [getFormattedRange]);

  // Memoize quick select options
  const quickSelectOptions = useMemo(
    () => [
      { label: "Last 7 days", days: 7 },
      { label: "Last 30 days", days: 30 },
      { label: "This month", days: "month" },
    ],
    []
  );

  const handleQuickSelect = useCallback(
    (option) => {
      const today = new Date();
      let start, end;

      if (option.days === "month") {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Ensure end date doesn't exceed today
        if (formatDateForStore(end) > todayStr) {
          end = today;
        }
      } else {
        end = today;
        start = new Date(today);
        start.setDate(start.getDate() - option.days + 1);
      }

      setDateRange(formatDateForStore(start), formatDateForStore(end));
      setSelectingStart(true);
      setIsOpen(false);
    },
    [formatDateForStore, setDateRange, todayStr]
  );

  // Check if next month navigation should be disabled
  const isNextMonthDisabled = useMemo(() => {
    const today = new Date();
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1
    );

    return (
      nextMonth.getFullYear() > today.getFullYear() ||
      (nextMonth.getFullYear() === today.getFullYear() &&
        nextMonth.getMonth() > today.getMonth())
    );
  }, [currentMonth]);

  return (
    <div className={cn("relative inline-block ", className)}>
      <p className="text-[#1F1F1F] text-[1vw]  font-[600] font-poppins-regular pb-3.5">
        Choose Date
      </p>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2">
          <PopoverTrigger
            asChild
            style={{
              backgroundColor: "transparent",
              border: "1px solid #B0C5D0",
            }}
          >
            <Button
              variant="outline"
              className={cn(
                "min-w-64 justify-start text-left font-normal",
                !getFormattedRange() && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span className="flex-1">{displayText}</span>
            </Button>
          </PopoverTrigger>

          {/* {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear selection</span>
            </Button>
          )} */}
        </div>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>

              <div className="text-sm font-medium">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={isNextMonthDisabled}
                className={cn(
                  "h-8 w-8 p-0",
                  isNextMonthDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>

            {/* Instructions */}
            <div className="mb-3 text-sm text-muted-foreground">
              {selectingStart
                ? "Select start date (past/present only)"
                : "Select end date (past/present only)"}
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayData) => {
                if (!dayData.date) {
                  return <div key={dayData.key} className="h-8 w-8" />;
                }

                return (
                  <Button
                    key={dayData.key}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateClick(dayData)}
                    disabled={dayData.isDisabled}
                    className={cn(
                      "h-8 w-8 p-0 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:ring-1",
                      dayData.isSelected &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      dayData.isInRange &&
                        !dayData.isSelected &&
                        "bg-accent text-accent-foreground",
                      dayData.isToday &&
                        !dayData.isSelected &&
                        !dayData.isInRange &&
                        "bg-accent font-semibold",
                      dayData.isDisabled &&
                        "text-muted-foreground opacity-30 cursor-not-allowed"
                    )}
                  >
                    {dayData.day}
                  </Button>
                );
              })}
            </div>

            {/* Quick Select Options */}
            <div className="mt-4 pt-3 border-t">
              <div className="text-xs text-muted-foreground mb-2">
                Quick select (past dates only):
              </div>
              <div className="flex gap-2 flex-wrap">
                {quickSelectOptions.map((option) => (
                  <Button
                    key={option.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(option)}
                    className="h-7 px-3 text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default memo(DateRangePicker);
