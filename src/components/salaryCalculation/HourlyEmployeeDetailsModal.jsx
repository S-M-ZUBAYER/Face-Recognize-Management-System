import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, RefreshCw, RotateCcw } from "lucide-react";
import { addDays, format, parseISO } from "date-fns";
import { useDateStore } from "@/zustand/useDateStore";
import calculateHourlySalary from "@/lib/calculateSalary/calculateHourlySalary";
import { useAllAttendanceStore } from "@/zustand/useAllAttendanceStore";

const HourlyEmployeeDetailsModal = ({ selectedEmp, setSelectedEmp }) => {
  const { selectedMonth, selectedYear } = useDateStore();
  const allAttendance = useAllAttendanceStore.getState().attendanceArray;

  const [employeeData, setEmployeeData] = useState({
    hourlySalaryRate: "",
    totalHoursWorked: "",
    totalPay: "",
    totalWorkedMinutes: "",
    dataSource: "initial", // 'initial' or 'calculated'
  });

  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCustomRange, setHasCustomRange] = useState(false);

  // Initialize with selectedEmp data and default date range
  useEffect(() => {
    if (selectedEmp) {
      const today = new Date();
      const isCurrentMonth =
        today.getMonth() === selectedMonth &&
        today.getFullYear() === selectedYear;

      const defaultStartDate = new Date(selectedYear, selectedMonth, 1);
      const defaultEndDate = isCurrentMonth
        ? today
        : new Date(selectedYear, selectedMonth + 1, 0);
      setDateRange({
        start: defaultStartDate,
        end: defaultEndDate,
      });

      setEmployeeData({
        hourlySalaryRate: selectedEmp.salaryDetails?.hourlySalaryRate || "0",
        totalHoursWorked: selectedEmp.salaryDetails?.totalHoursWorked || "0",
        totalPay: selectedEmp.salaryDetails?.totalPay || "0",
        totalWorkedMinutes:
          selectedEmp.salaryDetails?.totalWorkedMinutes || "0",
        dataSource: "initial",
      });

      setHasCustomRange(false);
    }
  }, [selectedEmp, selectedMonth, selectedYear]);

  // Handle date changes
  const handleStartDateChange = (date) => {
    if (!date) return;
    if (dateRange.end && date > dateRange.end) {
      setDateRange({ start: date, end: date });
    } else {
      setDateRange((prev) => ({ ...prev, start: date }));
    }
    setHasCustomRange(true);
  };

  const handleEndDateChange = (date) => {
    if (!date) return;
    if (dateRange.start && date < dateRange.start) {
      setDateRange({ start: date, end: date });
    } else {
      setDateRange((prev) => ({ ...prev, end: date }));
    }
    setHasCustomRange(true);
  };

  // Calculate salary function
  const calculateSalary = useCallback(async () => {
    if (!selectedEmp || !dateRange.start || !dateRange.end) {
      return;
    }

    setIsCalculating(true);

    try {
      const id = selectedEmp.employeeId;

      const formatDateForComparison = (date) => {
        return format(date, "yyyy-MM-dd");
      };

      let startDateStr;
      let endDateStr;

      const rulesModel = selectedEmp.salaryRules.rules.find(
        (item) => item.ruleId === 0
      ) || {
        param1: [],
        param2: [],
        param3: "normal",
      };

      startDateStr = formatDateForComparison(dateRange.start);

      endDateStr =
        rulesModel.param3 === "special"
          ? formatDateForComparison(addDays(dateRange.end, 1))
          : formatDateForComparison(dateRange.end);

      // console.log("Calculating for date range:", {
      //   start: startDateStr,
      //   end: endDateStr,
      //   employeeId: id,
      // });

      // Filter attendance records
      const attendanceRecords = allAttendance.filter((item) => {
        try {
          // Handle different date formats
          let itemDate;
          if (typeof item.date === "string") {
            if (item.date.includes("T")) {
              itemDate = parseISO(item.date);
            } else {
              itemDate = new Date(item.date);
            }
          } else if (item.date instanceof Date) {
            itemDate = item.date;
          } else {
            return false;
          }

          const itemDateStr = format(itemDate, "yyyy-MM-dd");
          const matchesEmployee = String(item.empId) === String(id);
          const inDateRange =
            itemDateStr >= startDateStr && itemDateStr <= endDateStr;

          return matchesEmployee && inDateRange;
        } catch (error) {
          console.error("Error processing attendance record:", error, item);
          return false;
        }
      });

      // console.log(
      //   "Filtered attendance records:",
      //   attendanceRecords.length,
      //   attendanceRecords
      // );

      if (attendanceRecords.length > 0) {
        const Range = {
          startDateStr: formatDateForComparison(dateRange.start),
          endDateStr: formatDateForComparison(dateRange.end),
        };

        const response = calculateHourlySalary(
          attendanceRecords,
          selectedEmp?.salaryRules,
          selectedEmp?.salaryInfo,
          Range
        );

        // console.log("Calculation response:", response);

        if (response) {
          setEmployeeData({
            hourlySalaryRate:
              response?.hourlySalaryRate ||
              selectedEmp?.hourlySalaryRate ||
              "0",
            totalHoursWorked: response?.totalHoursWorked || "0",
            totalPay: response?.totalPay || "0",
            totalWorkedMinutes: response?.totalWorkedMinutes || "0",
            dataSource: "calculated",
          });
        } else {
          // Handle empty response
          setEmployeeData({
            ...employeeData,
            totalHoursWorked: "0",
            totalPay: "0",
            totalWorkedMinutes: "0",
            dataSource: "calculated",
          });
        }
      } else {
        // No records found
        setEmployeeData({
          ...employeeData,
          totalHoursWorked: "0",
          totalPay: "0",
          totalWorkedMinutes: "0",
          dataSource: "calculated",
        });
      }
    } catch (error) {
      console.error("Error calculating salary:", error);
      // Keep current data on error
    } finally {
      setIsCalculating(false);
    }
  }, [selectedEmp, dateRange, allAttendance, employeeData]);

  // Reset to initial month data
  const resetToMonthData = () => {
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === selectedMonth &&
      today.getFullYear() === selectedYear;

    const defaultStartDate = new Date(selectedYear, selectedMonth, 1);
    const defaultEndDate = isCurrentMonth
      ? today
      : new Date(selectedYear, selectedMonth + 1, 0);
    console.log(defaultEndDate);
    setDateRange({
      start: defaultStartDate,
      end: defaultEndDate,
    });

    setEmployeeData({
      hourlySalaryRate: selectedEmp.salaryDetails?.hourlySalaryRate || "0",
      totalHoursWorked: selectedEmp.salaryDetails?.totalHoursWorked || "0",
      totalPay: selectedEmp.salaryDetails?.totalPay || "0",
      totalWorkedMinutes: selectedEmp.salaryDetails?.totalWorkedMinutes || "0",
      dataSource: "initial",
    });

    setHasCustomRange(false);
  };

  // Calculate totals for display
  const totalWorkedMinutes = parseFloat(employeeData.totalWorkedMinutes || 0);
  const totalHoursWorked = totalWorkedMinutes / 60;
  const hourlySalaryRate = parseFloat(employeeData.hourlySalaryRate || 0);
  const totalSalary = totalHoursWorked * hourlySalaryRate;

  // Calculate period info
  const totalDays = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return 1;

    let start = new Date(dateRange.start);
    let end = new Date(dateRange.end);

    // Swap if reversed
    if (end < start) {
      [start, end] = [end, start];
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(1, diffDays + 1);
  }, [dateRange.start, dateRange.end]);

  const dailyAverageHours = totalHoursWorked / totalDays;
  const dailyAveragePay = totalSalary / totalDays;

  // Format helpers
  const formatNumber = (num) => {
    const parsed = parseFloat(num);
    if (isNaN(parsed) || !isFinite(parsed)) return "0.00";
    return parsed.toFixed(2);
  };

  const formatTime = (minutes) => {
    const mins = parseFloat(minutes);
    if (isNaN(mins) || mins === 0) return "0h 0m";
    const hours = Math.floor(mins / 60);
    const remainingMins = Math.floor(mins % 60);
    return `${hours}h ${remainingMins}m`;
  };

  // Determine if calculate button should be enabled
  const canCalculate = dateRange.start && dateRange.end && !isCalculating;

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
            className="absolute inset-0 bg-black/5 backdrop-blur-sm"
            onClick={() => setSelectedEmp(null)}
          />

          <motion.div
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-[#004368] p-4 text-white">
              <div className="flex justify-between items-center">
                <div className="max-w-[80%]">
                  <h2 className="text-lg font-semibold truncate">
                    {selectedEmp?.name?.split("<")[0]}
                  </h2>
                  <p className="text-white/80 text-xs mt-0.5">
                    Hourly Employee • {selectedMonth + 1}/{selectedYear}
                    {hasCustomRange && " • Custom Range"}
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

            {/* Date Range Section */}
            <div className="bg-gray-50 p-3 border-b">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800 text-sm">
                    Date Range
                  </h3>
                  <div className="flex gap-2">
                    {hasCustomRange && (
                      <Button
                        onClick={resetToMonthData}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Start Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2 flex-1"
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {dateRange.start
                          ? format(dateRange.start, "MMM d")
                          : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.start}
                        onSelect={handleStartDateChange}
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-gray-400 text-xs">to</span>

                  {/* End Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2 flex-1"
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {dateRange.end
                          ? format(dateRange.end, "MMM d")
                          : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.end}
                        onSelect={handleEndDateChange}
                        initialFocus
                        disabled={(date) =>
                          date > new Date() ||
                          (dateRange.start && date < dateRange.start)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {totalDays} day{totalDays !== 1 ? "s" : ""}
                  </p>

                  <Button
                    onClick={calculateSalary}
                    disabled={!canCalculate}
                    size="sm"
                    className="h-7 text-xs px-3 bg-[#004368] hover:bg-[#004260] text-white"
                  >
                    {isCalculating ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Calculate
                  </Button>
                </div>

                {hasCustomRange && employeeData.dataSource === "calculated" && (
                  <p className="text-xs text-green-600">
                    Showing data for selected range
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-4">
              <div className="space-y-4">
                {/* Total Pay Card */}
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        Total Pay
                      </h3>
                      <p className="text-xs text-gray-500">
                        {employeeData.dataSource === "calculated"
                          ? "For selected period"
                          : "For full month"}
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

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <div className="text-base font-bold text-[#004368]">
                      {formatNumber(employeeData.hourlySalaryRate)}
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
                      {formatTime(employeeData.totalWorkedMinutes)}
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

                {/* Calculation Details */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-800 mb-2 text-xs">
                    Calculation Breakdown
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Minutes:</span>
                      <span className="font-medium">
                        {formatNumber(employeeData.totalWorkedMinutes)}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Convert to Hours:</span>
                      <span className="font-medium">
                        {formatNumber(employeeData.totalWorkedMinutes)} ÷ 60 ={" "}
                        {formatNumber(totalHoursWorked)}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Multiply by Rate:</span>
                      <span className="font-medium">
                        {formatNumber(totalHoursWorked)} ×{" "}
                        {formatNumber(employeeData.hourlySalaryRate)}
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

                {/* Daily Average */}
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

            {/* Footer */}
            <div className="border-t p-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Data Source:</span>{" "}
                  {employeeData.dataSource === "initial"
                    ? "Full Month"
                    : "Custom Range"}
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
