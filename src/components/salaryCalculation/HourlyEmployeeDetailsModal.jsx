import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useDateStore } from "@/zustand/useDateStore";
import calculateWorkedTime from "@/lib/calculateWorkedTime";

const HourlyEmployeeDetailsModal = ({ selectedEmp, setSelectedEmp }) => {
  const { selectedMonth, selectedYear } = useDateStore();
  const [hourlyRate, setHourlyRate] = useState(0);
  const [totalWorkedMinutes, setTotalWorkedMinutes] = useState(0);

  // Set date range based on selected month
  const [startDate, setStartDate] = useState(() => {
    return new Date(selectedYear, selectedMonth, 1); // 1st day of selected month
  });

  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === selectedMonth &&
      today.getFullYear() === selectedYear;

    if (isCurrentMonth) {
      return today; // Today's date for current month
    } else {
      return new Date(selectedYear, selectedMonth + 1, 0); // Last day of selected month for previous months
    }
  });
  // Handle date change properly
  const handleStartDateChange = (date) => {
    if (!date) return;
    if (date > endDate) {
      setEndDate(date);
    }
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    if (!date) return;
    if (date < startDate) {
      setStartDate(date);
    }
    setEndDate(date);
  };

  // Filter punch details by date range
  function filterByDateRange(data, startDate, endDate) {
    if (!data || !Array.isArray(data)) return [];

    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);

    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    return data.filter((item) => {
      try {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= normalizedStart && itemDate <= normalizedEnd;
      } catch (error) {
        console.error("Error parsing date:", item.date, error);
        return false;
      }
    });
  }

  // Recalculate salary when dates change
  useEffect(() => {
    if (!selectedEmp || !selectedEmp.salaryDetails?.punchDetails) return;

    const rate = selectedEmp.salaryInfo?.salary || 0;
    setHourlyRate(rate);

    const filteredPunches = filterByDateRange(
      selectedEmp.salaryDetails.punchDetails,
      startDate,
      endDate
    );

    if (filteredPunches.length > 0) {
      let totalMinutes = 0;
      filteredPunches.forEach((dayData) => {
        try {
          const { punches, workingDecoded } = dayData;
          if (workingDecoded && punches) {
            const workedMinutes = calculateWorkedTime(workingDecoded, punches);
            totalMinutes += workedMinutes;
          }
        } catch (error) {
          console.error("Error calculating worked time:", error);
        }
      });

      setTotalWorkedMinutes(totalMinutes);
    } else {
      setTotalWorkedMinutes(0);
    }
  }, [startDate, endDate, selectedEmp]);

  // Calculate totals
  const totalHoursWorked = totalWorkedMinutes / 60;
  const totalSalary = totalHoursWorked * hourlyRate;

  // Format helpers
  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num) || !isFinite(num))
      return "0.00";
    return parseFloat(num).toFixed(2);
  };

  const formatTime = (minutes) => {
    if (!minutes || isNaN(minutes)) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Get period info
  const totalDays = Math.max(
    1,
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
  );
  const dailyAverageHours = totalHoursWorked / totalDays;
  const dailyAveragePay = totalSalary / totalDays;

  return (
    <AnimatePresence>
      {selectedEmp && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedEmp(null)}
          />

          <motion.div
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-[#004368] p-4 text-white">
              <div className="flex justify-between items-center">
                <div className="max-w-[80%]">
                  <h2 className="text-lg font-semibold truncate">
                    {selectedEmp?.name?.split("<")[0]}
                  </h2>
                  <p className="text-white/80 text-xs mt-0.5">
                    Hourly Employee • {selectedMonth}/{selectedYear}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEmp(null)}
                  className="p-1 hover:bg-white/10 rounded text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-3 border-b">
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-gray-800 text-sm">
                  Date Range
                </h3>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2"
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {format(startDate, "MMM d")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateChange}
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-gray-400 text-xs">to</span>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2"
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {format(endDate, "MMM d")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateChange}
                        initialFocus
                        disabled={(date) =>
                          date > new Date() || date < startDate
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-xs text-gray-500">{totalDays} days</p>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-4">
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        Total Pay
                      </h3>
                      <p className="text-xs text-gray-500">
                        For selected period
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#004368]">
                        {formatNumber(totalSalary)}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatNumber(totalHoursWorked)} hours worked
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <div className="text-base font-bold text-[#004368]">
                      {formatNumber(hourlyRate)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Hourly Rate
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <div className="text-base font-bold text-gray-800">
                      {formatNumber(totalHoursWorked)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total Hours
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <div className="text-sm font-bold text-gray-800">
                      {formatTime(totalWorkedMinutes)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Total Time</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <div className="text-base font-bold text-gray-800">
                      {totalDays}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Days</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-800 mb-2 text-xs">
                    Calculation
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Minutes:</span>
                      <span className="font-medium">{totalWorkedMinutes}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Convert to Hours:</span>
                      <span className="font-medium">
                        {totalWorkedMinutes} ÷ 60 ={" "}
                        {formatNumber(totalHoursWorked)}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Multiply by Rate:</span>
                      <span className="font-medium">
                        {formatNumber(totalHoursWorked)} ×{" "}
                        {formatNumber(hourlyRate)}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-1">
                      <div className="flex justify-between font-semibold">
                        <span>Total Pay:</span>
                        <span className="text-[#004368]">
                          {formatNumber(totalSalary)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-3">
                  <h4 className="font-medium text-gray-800 mb-2 text-xs">
                    Daily Average
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-800">
                        {formatNumber(dailyAverageHours)}h
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Hours per day
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#004368]">
                        {formatNumber(dailyAveragePay)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Pay per day
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Rate:</span>{" "}
                  {formatNumber(hourlyRate)}/hour
                </div>
                <Button
                  onClick={() => setSelectedEmp(null)}
                  className="bg-[#004368] hover:bg-[#003050] text-white text-xs px-3 py-1.5 h-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HourlyEmployeeDetailsModal;
