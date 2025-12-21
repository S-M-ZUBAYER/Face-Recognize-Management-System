import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useDateStore } from "@/zustand/useDateStore";
import { calculateRangeSalary } from "@/lib/calculateRangeSalary";

const SemiMonthlyEmployeeDetailsModal = ({ selectedEmp, setSelectedEmp }) => {
  const { selectedMonth, selectedYear } = useDateStore.getState();
  const [semiMonthlyRange, setSemiMonthlyRange] = useState(() => {
    const splitEndDate = selectedEmp?.salaryInfo?.splitEndDate || 15;
    return getSemiMonthlyRange(selectedYear, selectedMonth, splitEndDate, 0);
  });
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periodOffset, setPeriodOffset] = useState(0);

  // Fetch semi-monthly salary data
  useEffect(() => {
    if (!selectedEmp) return;

    const fetchSemiMonthlySalary = async () => {
      setLoading(true);
      const payPeriod = selectedEmp.salaryInfo;
      const salaryRules = selectedEmp.salaryRules || {};
      const id = selectedEmp.employeeId;
      const startDate = semiMonthlyRange.startDate;
      const endDate = semiMonthlyRange.endDate;
      try {
        const data = await calculateRangeSalary(
          payPeriod,
          salaryRules,
          startDate,
          endDate,
          id
        );
        setSalaryData(data);
      } catch (error) {
        console.error("Error calculating semi-monthly salary:", error);
        setSalaryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSemiMonthlySalary();
  }, [selectedEmp, semiMonthlyRange]);

  // Handle semi-monthly navigation
  const handlePreviousPeriod = () => {
    const newOffset = periodOffset === 0 ? 1 : 0;
    setPeriodOffset(newOffset);
    const splitEndDate = selectedEmp?.salaryInfo?.splitEndDate || 15;
    const newRange = getSemiMonthlyRange(
      selectedYear,
      selectedMonth,
      splitEndDate,
      newOffset
    );
    setSemiMonthlyRange(newRange);
  };

  const handleNextPeriod = () => {
    const newOffset = periodOffset === 0 ? 1 : 0;
    setPeriodOffset(newOffset);
    const splitEndDate = selectedEmp?.salaryInfo?.splitEndDate || 15;
    const newRange = getSemiMonthlyRange(
      selectedYear,
      selectedMonth,
      splitEndDate,
      newOffset
    );
    setSemiMonthlyRange(newRange);
  };

  const handleFirstHalf = () => {
    setPeriodOffset(0);
    const splitEndDate = selectedEmp?.salaryInfo?.splitEndDate || 15;
    const newRange = getSemiMonthlyRange(
      selectedYear,
      selectedMonth,
      splitEndDate,
      0
    );
    setSemiMonthlyRange(newRange);
  };

  const handleSecondHalf = () => {
    setPeriodOffset(1);
    const splitEndDate = selectedEmp?.salaryInfo?.splitEndDate || 15;
    const newRange = getSemiMonthlyRange(
      selectedYear,
      selectedMonth,
      splitEndDate,
      1
    );
    setSemiMonthlyRange(newRange);
  };

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    return format(new Date(dateStr), "MMM d, yyyy");
  };

  // Format number
  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return "0.00";
    return parseFloat(num).toFixed(2);
  };

  // Calculate total deductions
  const totalDeductions =
    (salaryData?.deductions?.absentDeductions || 0) +
    (salaryData?.deductions?.missedPunchDeductions || 0) +
    (salaryData?.deductions?.lateDeductions || 0) +
    (salaryData?.deductions?.earlyDeductions || 0) +
    (salaryData?.LeaveDeduction?.wLeaveDeduction || 0) +
    (salaryData?.LeaveDeduction?.oLeaveDeduction || 0) +
    (salaryData?.LeaveDeduction?.sLeaveDeduction || 0);

  // Calculate total extra pay
  const totalExtraPay =
    (salaryData?.extraPay?.weekendNormalShiftPay || 0) +
    (salaryData?.extraPay?.holidayNormalShiftPay || 0);

  // Get days in period
  const getDaysInPeriod = () => {
    const start = new Date(semiMonthlyRange.startDate);
    const end = new Date(semiMonthlyRange.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const daysInPeriod = getDaysInPeriod();

  return (
    <AnimatePresence>
      {selectedEmp && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedEmp(null)}
          />

          {/* Modal Container */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004368] to-[#003050] p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedEmp?.name?.split("<")[0]}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Semi-Monthly Salary Details • {selectedEmp?.department} •{" "}
                    {semiMonthlyRange.part === "FIRST_HALF"
                      ? "1st Half"
                      : "2nd Half"}{" "}
                    of {selectedMonth}/{selectedYear}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEmp(null)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Semi-Monthly Navigation */}
            <div className="bg-gray-50 border-b p-4">
              <div className="flex items-center justify-between">
                <Button
                  onClick={handlePreviousPeriod}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {periodOffset === 1 ? "1st Half" : "2nd Half"}
                </Button>

                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {semiMonthlyRange.part === "FIRST_HALF"
                      ? "1st Half"
                      : "2nd Half"}{" "}
                    • {formatDisplayDate(semiMonthlyRange.startDate)} -{" "}
                    {formatDisplayDate(semiMonthlyRange.endDate)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {daysInPeriod} days • Split at day{" "}
                    {selectedEmp?.salaryInfo?.splitEndDate || 15}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleFirstHalf}
                    variant={periodOffset === 0 ? "default" : "outline"}
                    size="sm"
                    className={periodOffset === 0 ? "bg-[#004368]" : ""}
                  >
                    1st Half
                  </Button>
                  <Button
                    onClick={handleSecondHalf}
                    variant={periodOffset === 1 ? "default" : "outline"}
                    size="sm"
                    className={periodOffset === 1 ? "bg-[#004368]" : ""}
                  >
                    2nd Half
                  </Button>
                  <Button
                    onClick={handleNextPeriod}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {periodOffset === 0 ? "2nd Half" : "1st Half"}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004368] mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Calculating semi-monthly salary...
                  </p>
                </div>
              ) : salaryData ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Column 1 - Financial Overview */}
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Salary Breakdown */}
                    <div className="bg-white p-5 rounded-2xl border shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                        {semiMonthlyRange.part === "FIRST_HALF"
                          ? "First Half"
                          : "Second Half"}{" "}
                        Salary
                      </h3>
                      <div className="space-y-4">
                        {/* Standard Pay */}
                        <div className="flex justify-between items-center py-3 border-b">
                          <div>
                            <p className="font-medium text-gray-700 text-sm">
                              Standard Pay
                            </p>
                            <p className="text-xs text-gray-500">
                              Base salary for{" "}
                              {semiMonthlyRange.part === "FIRST_HALF"
                                ? "1st half"
                                : "2nd half"}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatNumber(salaryData?.standardPay || 0)}
                          </span>
                        </div>

                        {/* Overtime Earnings */}
                        {salaryData?.overtimePay > 0 && (
                          <div className="flex justify-between items-center py-3 border-b">
                            <div>
                              <p className="font-medium text-gray-700 text-sm">
                                Overtime Pay
                              </p>
                              <p className="text-xs text-gray-500">
                                {salaryData?.overtimeDetails?.normal || 0}h
                                normal +{" "}
                                {salaryData?.overtimeDetails?.weekend || 0}h
                                weekend +{" "}
                                {salaryData?.overtimeDetails?.holiday || 0}h
                                holiday
                              </p>
                            </div>
                            <span className="text-lg font-bold text-blue-600">
                              +{formatNumber(salaryData?.overtimePay || 0)}
                            </span>
                          </div>
                        )}

                        {/* Extra Pay */}
                        {totalExtraPay > 0 && (
                          <div className="flex justify-between items-center py-3 border-b">
                            <div>
                              <p className="font-medium text-gray-700 text-sm">
                                Extra Pay
                              </p>
                              <p className="text-xs text-gray-500">
                                Weekend:{" "}
                                {formatNumber(
                                  salaryData?.extraPay?.weekendNormalShiftPay ||
                                    0
                                )}{" "}
                                • Holiday:{" "}
                                {formatNumber(
                                  salaryData?.extraPay?.holidayNormalShiftPay ||
                                    0
                                )}
                              </p>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              +{formatNumber(totalExtraPay)}
                            </span>
                          </div>
                        )}

                        {/* Total Deductions */}
                        <div className="flex justify-between items-center py-3 border-b">
                          <div>
                            <p className="font-medium text-gray-700 text-sm">
                              Total Deductions
                            </p>
                            <p className="text-xs text-gray-500">
                              All applicable deductions
                            </p>
                          </div>
                          <span className="text-lg font-bold text-red-600">
                            -{formatNumber(totalDeductions)}
                          </span>
                        </div>

                        {/* Total Pay */}
                        <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-3 px-3 rounded-lg">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              {semiMonthlyRange.part === "FIRST_HALF"
                                ? "1st Half"
                                : "2nd Half"}{" "}
                              Total
                            </p>
                            <p className="text-xs text-gray-600">
                              Net amount for period
                            </p>
                          </div>
                          <span className="text-xl font-bold text-gray-900">
                            {formatNumber(salaryData?.totalPay || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Period Information */}
                    <div className="bg-white p-5 rounded-2xl border shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                        Period Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Period:</span>
                          <span className="font-medium">
                            {semiMonthlyRange.part === "FIRST_HALF"
                              ? "1st Half"
                              : "2nd Half"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Split Date:</span>
                          <span className="font-medium">
                            Day {selectedEmp?.salaryInfo?.splitEndDate || 15}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Days in Period:</span>
                          <span className="font-medium">
                            {daysInPeriod} days
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Month:</span>
                          <span className="font-medium">
                            {selectedMonth}/{selectedYear}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Overview */}
                    <div className="bg-white p-5 rounded-2xl border shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                        Attendance Overview
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <div className="text-xl font-bold text-green-600">
                            {salaryData?.Present?.normalPresent || 0}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Normal Days
                          </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-xl">
                          <div className="text-xl font-bold text-purple-600">
                            {salaryData?.Present?.holidayPresent || 0}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Holiday Days
                          </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <div className="text-xl font-bold text-blue-600">
                            {salaryData?.Present?.weekendPresent || 0}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Weekend Days
                          </div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-xl">
                          <div className="text-xl font-bold text-red-600">
                            {salaryData?.absent || 0}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Absent Days
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Column 2 - Detailed Breakdown */}
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {/* Overtime Details */}
                    {(salaryData?.overtimeDetails?.normal > 0 ||
                      salaryData?.overtimeDetails?.weekend > 0 ||
                      salaryData?.overtimeDetails?.holiday > 0) && (
                      <div className="bg-white p-5 rounded-2xl border shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                          Overtime Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Normal Hours</span>
                            <div className="text-right">
                              <span className="font-medium">
                                {salaryData?.overtimeDetails?.normal || 0}h
                              </span>
                              <p className="text-xs text-gray-500">
                                Rate:{" "}
                                {formatNumber(salaryData?.overtimeSalary || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Weekend Hours</span>
                            <div className="text-right">
                              <span className="font-medium">
                                {salaryData?.overtimeDetails?.weekend || 0}h
                              </span>
                              <p className="text-xs text-gray-500">
                                Rate:{" "}
                                {formatNumber(salaryData?.overtimeSalary || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Holiday Hours</span>
                            <div className="text-right">
                              <span className="font-medium">
                                {salaryData?.overtimeDetails?.holiday || 0}h
                              </span>
                              <p className="text-xs text-gray-500">
                                Rate:{" "}
                                {formatNumber(salaryData?.overtimeSalary || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="border-t pt-3 mt-2">
                            <div className="flex justify-between items-center text-sm font-medium">
                              <span>Total Overtime Pay</span>
                              <span className="text-blue-600">
                                {formatNumber(salaryData?.overtimePay || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detailed Deductions */}
                    <div className="bg-white p-5 rounded-2xl border shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                        Detailed Deductions
                      </h3>
                      <div className="space-y-3">
                        {/* Attendance Deductions */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700 text-xs uppercase tracking-wide">
                            Attendance
                          </h4>
                          <div className="flex justify-between items-center text-sm py-1">
                            <span className="text-gray-600">Absent</span>
                            <span className="text-red-600">
                              -
                              {formatNumber(
                                salaryData?.deductions?.absentDeductions || 0
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm py-1">
                            <span className="text-gray-600">Extra Absent</span>
                            <span className="text-red-600">
                              -
                              {formatNumber(
                                salaryData?.deductions?.extraAbsentDeductions ||
                                  0
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm py-1">
                            <span className="text-gray-600">
                              Missed Punches
                            </span>
                            <span className="text-red-600">
                              -
                              {formatNumber(
                                salaryData?.deductions?.missedPunchDeductions ||
                                  0
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm py-1">
                            <span className="text-gray-600">Late Arrivals</span>
                            <span className="text-red-600">
                              -
                              {formatNumber(
                                salaryData?.deductions?.lateDeductions || 0
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm py-1">
                            <span className="text-gray-600">
                              Early Departures
                            </span>
                            <span className="text-red-600">
                              -
                              {formatNumber(
                                salaryData?.deductions?.earlyDeductions || 0
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Leave Deductions */}
                        <div className="space-y-2 pt-2 border-t">
                          <h4 className="font-medium text-gray-700 text-xs uppercase tracking-wide">
                            Leave Deductions
                          </h4>
                          <div className="flex justify-between items-center text-sm py-1">
                            <span className="text-gray-600">W Leave</span>
                            <span className="text-red-600">
                              -
                              {formatNumber(
                                salaryData?.LeaveDeduction?.wLeaveDeduction || 0
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm py-1">
                            <span className="text-gray-600">O Leave</span>
                            <span className="text-red-600">
                              -
                              {formatNumber(
                                salaryData?.LeaveDeduction?.oLeaveDeduction || 0
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm py-1">
                            <span className="text-gray-600">S Leave</span>
                            <span className="text-red-600">
                              -
                              {formatNumber(
                                salaryData?.LeaveDeduction?.sLeaveDeduction || 0
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Total Deductions Summary */}
                        <div className="pt-3 border-t mt-2">
                          <div className="flex justify-between items-center text-sm font-medium">
                            <span>Total Deductions</span>
                            <span className="text-red-600">
                              -{formatNumber(totalDeductions)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Extra Pay Details */}
                    {totalExtraPay > 0 && (
                      <div className="bg-white p-5 rounded-2xl border shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                          Extra Pay Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Weekend Normal Shift
                            </span>
                            <span className="font-medium text-green-600">
                              +
                              {formatNumber(
                                salaryData?.extraPay?.weekendNormalShiftPay || 0
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Holiday Normal Shift
                            </span>
                            <span className="font-medium text-green-600">
                              +
                              {formatNumber(
                                salaryData?.extraPay?.holidayNormalShiftPay || 0
                              )}
                            </span>
                          </div>
                          <div className="border-t pt-2 mt-1">
                            <div className="flex justify-between items-center text-sm font-medium">
                              <span>Total Extra Pay</span>
                              <span className="text-green-600">
                                +{formatNumber(totalExtraPay)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Column 3 - Analytics & Performance */}
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Performance Metrics */}
                    <div className="bg-white p-5 rounded-2xl border shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                        Performance Metrics
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Late Count</span>
                            <span className="font-medium">
                              {salaryData?.attendanceStats?.lateCount || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-yellow-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (salaryData?.attendanceStats?.lateCount ||
                                    0) * 10,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">
                              Early Departures
                            </span>
                            <span className="font-medium">
                              {salaryData?.attendanceStats
                                ?.earlyDepartureCount || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-orange-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (salaryData?.attendanceStats
                                    ?.earlyDepartureCount || 0) * 10,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">
                              Missed Punches
                            </span>
                            <span className="font-medium">
                              {salaryData?.attendanceStats?.missedPunch || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-red-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (salaryData?.attendanceStats?.missedPunch ||
                                    0) * 10,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">
                              Total Lateness Minutes
                            </span>
                            <span className="font-medium">
                              {salaryData?.attendanceStats
                                ?.totalLatenessMinutes || 0}
                              m
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (salaryData?.attendanceStats
                                    ?.totalLatenessMinutes || 0) / 10,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Late Count Details */}
                    <div className="bg-white p-5 rounded-2xl border shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                        Late Count Details
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="text-md font-bold text-yellow-600">
                            {salaryData?.lateCountDetails?.halfDayLateCount ||
                              0}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Half Day Late
                          </div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="text-md font-bold text-red-600">
                            {salaryData?.lateCountDetails?.fullDayLateCount ||
                              0}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Full Day Late
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rule 11 Info */}
                    {salaryData?.rule11LeaveInfo?.hasRule11 && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                        <h3 className="font-semibold text-lg mb-2 text-blue-800">
                          Rule 11 Leave Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-blue-600">Daily Hours:</span>
                            <div className="font-semibold">
                              {salaryData.rule11LeaveInfo.dailyWorkingHours}h
                            </div>
                          </div>
                          <div>
                            <span className="text-blue-600">Rate Type:</span>
                            <div className="font-semibold">
                              {salaryData.rule11LeaveInfo.isFixedHourlyRate
                                ? "Fixed"
                                : "Calculated"}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-blue-600">
                              Total Leave Deductions:
                            </span>
                            <div className="font-semibold">
                              -
                              {formatNumber(
                                salaryData.rule11LeaveInfo.totalLeaveDeductions
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replace Days */}
                    {salaryData?.replaceDaysArr?.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-2xl border">
                        <h3 className="font-semibold text-gray-700 mb-2 text-sm">
                          Replace Days
                        </h3>
                        <div className="text-xs text-gray-600">
                          <p className="mb-2">
                            {salaryData.replaceDaysArr.length} replacement
                            day(s) applied
                          </p>
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {salaryData.replaceDaysArr.map((day, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-1 bg-white rounded"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>
                                  {day.date.slice(0, 10)} →{" "}
                                  {day.rdate
                                    ? day.rdate.slice(0, 10)
                                    : "No replacement"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    No salary data available for this semi-monthly period.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    {semiMonthlyRange.part === "FIRST_HALF"
                      ? "1st Half"
                      : "2nd Half"}{" "}
                    of {selectedMonth}/{selectedYear}:
                  </span>{" "}
                  {formatDisplayDate(semiMonthlyRange.startDate)} -{" "}
                  {formatDisplayDate(semiMonthlyRange.endDate)} • {daysInPeriod}{" "}
                  days
                </div>
                <Button
                  onClick={() => setSelectedEmp(null)}
                  className="bg-[#004368] hover:bg-[#003050] text-white"
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

// Helper functions
function formatDate(year, month, day) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function getSemiMonthlyRange(year, month, splitEndDate, direction = 0) {
  // Note: month is 1-12 (January = 1)
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  // Ensure splitEndDate is valid (1 to lastDayOfMonth-1)
  const safeSplit = Math.max(1, Math.min(splitEndDate, lastDayOfMonth - 1));

  const ranges = [
    { start: 1, end: safeSplit },
    { start: safeSplit + 1, end: lastDayOfMonth },
  ];

  const index = Math.abs(direction) % 2; // Ensure direction is 0 or 1
  const current = ranges[index];

  return {
    startDate: formatDate(year, month, current.start),
    endDate: formatDate(year, month, current.end),
    part: index === 0 ? "FIRST_HALF" : "SECOND_HALF",
  };
}

export default SemiMonthlyEmployeeDetailsModal;
