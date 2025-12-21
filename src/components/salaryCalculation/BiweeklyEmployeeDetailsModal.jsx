import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useDateStore } from "@/zustand/useDateStore";
import { calculateRangeSalary } from "@/lib/calculateRangeSalary";

const BiweeklyEmployeeDetailsModal = ({ selectedEmp, setSelectedEmp }) => {
  const { selectedMonth, selectedYear } = useDateStore.getState();
  const [biweeklyRange, setBiweeklyRange] = useState(() => {
    return getBiweeklyRangeWithDirection(
      selectedYear,
      selectedMonth,
      selectedEmp?.salaryInfo?.startDay + 1 || 0,
      0
    );
  });
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [biweeklyOffset, setBiweeklyOffset] = useState(0);

  // Fetch biweekly salary data
  useEffect(() => {
    if (!selectedEmp) return;

    const fetchBiweeklySalary = async () => {
      setLoading(true);
      const payPeriod = selectedEmp.salaryInfo;
      const salaryRules = selectedEmp.salaryRules || {};
      const id = selectedEmp.employeeId;
      const startDate = biweeklyRange.startDate;
      const endDate = biweeklyRange.endDate;
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
        console.error("Error calculating biweekly salary:", error);
        setSalaryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBiweeklySalary();
  }, [selectedEmp, biweeklyRange]);

  // Handle biweekly navigation
  const handlePreviousBiweekly = () => {
    const newOffset = biweeklyOffset - 1;
    setBiweeklyOffset(newOffset);
    const newRange = getBiweeklyRangeWithDirection(
      selectedYear,
      selectedMonth,
      selectedEmp?.salaryInfo?.startDay + 1 || 0,
      newOffset
    );
    setBiweeklyRange(newRange);
  };

  const handleNextBiweekly = () => {
    const newOffset = biweeklyOffset + 1;
    setBiweeklyOffset(newOffset);
    const newRange = getBiweeklyRangeWithDirection(
      selectedYear,
      selectedMonth,
      selectedEmp?.salaryInfo?.startDay + 1 || 0,
      newOffset
    );
    setBiweeklyRange(newRange);
  };

  const handleCurrentBiweekly = () => {
    setBiweeklyOffset(0);
    const newRange = getBiweeklyRangeWithDirection(
      selectedYear,
      selectedMonth,
      selectedEmp?.salaryInfo?.startDay + 1 || 0,
      0
    );
    setBiweeklyRange(newRange);
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
                    Biweekly Salary Details • {selectedEmp?.department} •
                    Period: {formatDisplayDate(biweeklyRange.startDate)} -{" "}
                    {formatDisplayDate(biweeklyRange.endDate)}
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

            {/* Biweekly Navigation */}
            <div className="bg-gray-50 border-b p-4">
              <div className="flex items-center justify-between">
                <Button
                  onClick={handlePreviousBiweekly}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Period
                </Button>

                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Biweekly Period:{" "}
                    {formatDisplayDate(biweeklyRange.startDate)} -{" "}
                    {formatDisplayDate(biweeklyRange.endDate)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    14 days •{" "}
                    {biweeklyOffset >= 0
                      ? biweeklyOffset === 0
                        ? "(Current Period)"
                        : `${biweeklyOffset} period${
                            biweeklyOffset !== 1 ? "s" : ""
                          } ahead`
                      : `${Math.abs(biweeklyOffset)} period${
                          Math.abs(biweeklyOffset) !== 1 ? "s" : ""
                        } ago`}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCurrentBiweekly}
                    variant="outline"
                    size="sm"
                  >
                    Current Period
                  </Button>
                  <Button
                    onClick={handleNextBiweekly}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    Next Period
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
                    Calculating biweekly salary...
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
                        Biweekly Salary Breakdown
                      </h3>
                      <div className="space-y-4">
                        {/* Standard Pay */}
                        <div className="flex justify-between items-center py-3 border-b">
                          <div>
                            <p className="font-medium text-gray-700 text-sm">
                              Standard Pay
                            </p>
                            <p className="text-xs text-gray-500">
                              Base salary for period
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
                              TOTAL PAY
                            </p>
                            <p className="text-xs text-gray-600">
                              Biweekly net amount
                            </p>
                          </div>
                          <span className="text-xl font-bold text-gray-900">
                            {formatNumber(salaryData?.totalPay || 0)}
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
                      <div className="mt-4 text-center text-sm text-gray-600">
                        {salaryData?.Present?.normalPresent +
                          salaryData?.Present?.holidayPresent +
                          salaryData?.Present?.weekendPresent +
                          (salaryData?.absent || 0)}{" "}
                        out of 14 days
                      </div>
                    </div>

                    {/* Period Breakdown */}
                    <div className="bg-white p-5 rounded-2xl border shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                        Period Breakdown
                      </h3>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="text-md font-bold text-orange-600">
                            {salaryData?.monthlyDetails?.thisMonthHolidays || 0}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Holidays
                          </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="text-md font-bold text-purple-600">
                            {salaryData?.monthlyDetails?.thisMonthLeave || 0}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Leaves
                          </div>
                        </div>
                        <div className="p-3 bg-cyan-50 rounded-lg">
                          <div className="text-md font-bold text-cyan-600">
                            {salaryData?.monthlyDetails?.thisMonthWeekends || 0}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Weekends
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
                    No salary data available for this biweekly period.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Biweekly Period:</span>{" "}
                  {formatDisplayDate(biweeklyRange.startDate)} -{" "}
                  {formatDisplayDate(biweeklyRange.endDate)}
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

// Helper function
function getBiweeklyRangeWithDirection(
  year,
  month,
  weekStartDay = 0,
  direction = 0
) {
  const firstDay = new Date(year, month, 1); // Month is 0-indexed
  const jsDay = firstDay.getDay();
  const normalizedDay = (jsDay + 6) % 7;

  let daysToStart;
  if (normalizedDay <= weekStartDay) {
    daysToStart = weekStartDay - normalizedDay;
  } else {
    daysToStart = 7 - (normalizedDay - weekStartDay);
  }

  // Apply direction offset (14 days per biweekly period)
  const directionOffset = direction * 14;

  const startDate = new Date(year, month, 1 + daysToStart + directionOffset);
  const endDate = new Date(year, month, 1 + daysToStart + directionOffset + 13);

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

export default BiweeklyEmployeeDetailsModal;
