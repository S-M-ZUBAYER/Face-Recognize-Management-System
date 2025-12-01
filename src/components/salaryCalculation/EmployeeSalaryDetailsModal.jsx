import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const EmployeeSalaryDetailsModal = ({ selectedEmp, setSelectedEmp }) => {
  const salaryDetails = selectedEmp?.salaryDetails;

  // Format number to 2 decimal places
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0.00";
    return parseFloat(num).toFixed(2);
  };

  // Calculate total deductions
  const totalDeductions =
    (salaryDetails?.deductions?.absentDeductions || 0) +
    (salaryDetails?.deductions?.missedPunchDeductions || 0) +
    (salaryDetails?.deductions?.lateDeductions || 0) +
    (salaryDetails?.deductions?.earlyDeductions || 0) +
    (salaryDetails?.LeaveDeduction?.wLeaveDeduction || 0) +
    (salaryDetails?.LeaveDeduction?.oLeaveDeduction || 0) +
    (salaryDetails?.LeaveDeduction?.sLeaveDeduction || 0);

  // Calculate total extra pay
  const totalExtraPay =
    (salaryDetails?.extraPay?.weekendNormalShiftPay || 0) +
    (salaryDetails?.extraPay?.holidayNormalShiftPay || 0);

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
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedEmp?.name?.split("<")[0]}
                  </h2>
                  <p className="text-gray-300 mt-1 text-sm">
                    {selectedEmp?.designation} • {selectedEmp?.department}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    ID: {selectedEmp?.companyEmployeeId} •{" "}
                    {selectedEmp?.salaryInfo?.shift}
                  </p>
                </div>
                <motion.button
                  onClick={() => setSelectedEmp(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
                {/* Column 1 - Financial Overview */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Salary Breakdown */}
                  <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                      Salary Breakdown
                    </h3>
                    <div className="space-y-4">
                      {/* Standard Pay */}
                      <div className="flex justify-between items-center py-3 border-b">
                        <div>
                          <p className="font-medium text-gray-700 text-sm">
                            Standard Pay
                          </p>
                          <p className="text-xs text-gray-500">Base salary</p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {formatNumber(salaryDetails?.standardPay)}
                        </span>
                      </div>

                      {/* Overtime Earnings */}
                      <div className="flex justify-between items-center py-3 border-b">
                        <div>
                          <p className="font-medium text-gray-700 text-sm">
                            Overtime Pay
                          </p>
                          <p className="text-xs text-gray-500">
                            {salaryDetails?.overtimeDetails?.normal || 0}h
                            normal +{" "}
                            {salaryDetails?.overtimeDetails?.weekend || 0}h
                            weekend +{" "}
                            {salaryDetails?.overtimeDetails?.holiday || 0}h
                            holiday
                          </p>
                          <p className="text-xs text-gray-500">
                            Rate: {formatNumber(salaryDetails?.overtimeSalary)}
                            /hour
                          </p>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          +{formatNumber(salaryDetails?.overtimePay)}
                        </span>
                      </div>

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
                                salaryDetails?.extraPay?.weekendNormalShiftPay
                              )}{" "}
                              • Holiday:{" "}
                              {formatNumber(
                                salaryDetails?.extraPay?.holidayNormalShiftPay
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
                          <p className="text-xs text-gray-600">Final amount</p>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {formatNumber(salaryDetails?.totalPay)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overtime Details */}
                  <div className="bg-gray-50 p-5 rounded-2xl border">
                    <h3 className="font-semibold text-gray-700 mb-4 text-sm">
                      Overtime Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Normal Hours</span>
                        <div className="text-right">
                          <span className="font-medium">
                            {salaryDetails?.overtimeDetails?.normal || 0}h
                          </span>
                          <p className="text-xs text-gray-500">
                            Rate: {formatNumber(salaryDetails?.overtimeSalary)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Weekend Hours</span>
                        <div className="text-right">
                          <span className="font-medium">
                            {salaryDetails?.overtimeDetails?.weekend || 0}h
                          </span>
                          <p className="text-xs text-gray-500">
                            Rate: {formatNumber(salaryDetails?.overtimeSalary)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Holiday Hours</span>
                        <div className="text-right">
                          <span className="font-medium">
                            {salaryDetails?.overtimeDetails?.holiday || 0}h
                          </span>
                          <p className="text-xs text-gray-500">
                            Rate: {formatNumber(salaryDetails?.overtimeSalary)}
                          </p>
                        </div>
                      </div>
                      <div className="border-t pt-3 mt-2">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>Total Overtime Pay</span>
                          <span className="text-blue-600">
                            {formatNumber(salaryDetails?.overtimePay)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Column 2 - Attendance & Presence */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Attendance Overview */}
                  <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                      Attendance Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-xl font-bold text-green-600">
                          {salaryDetails?.Present?.normalPresent || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Normal Days
                        </div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <div className="text-xl font-bold text-purple-600">
                          {salaryDetails?.Present?.holidayPresent || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Holiday Days
                        </div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-xl font-bold text-blue-600">
                          {salaryDetails?.Present?.weekendPresent || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Weekend Days
                        </div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-xl">
                        <div className="text-xl font-bold text-red-600">
                          {salaryDetails?.absent || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Absent Days
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">
                          Total Working Days
                        </span>
                        <span className="font-medium">
                          {salaryDetails?.workingDays || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Breakdown */}
                  <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                      Monthly Breakdown
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-md font-bold text-orange-600">
                          {salaryDetails?.monthlyDetails?.thisMonthHolidays ||
                            0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Holidays
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-md font-bold text-purple-600">
                          {salaryDetails?.monthlyDetails?.thisMonthLeave || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Leaves</div>
                      </div>
                      <div className="p-3 bg-cyan-50 rounded-lg">
                        <div className="text-md font-bold text-cyan-600">
                          {salaryDetails?.monthlyDetails?.thisMonthWeekends ||
                            0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Weekends
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extra Pay Details */}
                  {(salaryDetails?.extraPay?.weekendNormalShiftPay > 0 ||
                    salaryDetails?.extraPay?.holidayNormalShiftPay > 0) && (
                    <div className="bg-white p-5 rounded-2xl border">
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
                              salaryDetails?.extraPay?.weekendNormalShiftPay
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
                              salaryDetails?.extraPay?.holidayNormalShiftPay
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

                {/* Column 3 - Deductions & Analytics */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Detailed Deductions */}
                  <div className="bg-white p-5 rounded-2xl border">
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
                              salaryDetails?.deductions?.absentDeductions
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-1">
                          <span className="text-gray-600">Missed Punches</span>
                          <span className="text-red-600">
                            -
                            {formatNumber(
                              salaryDetails?.deductions?.missedPunchDeductions
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-1">
                          <span className="text-gray-600">Late Arrivals</span>
                          <span className="text-red-600">
                            -
                            {formatNumber(
                              salaryDetails?.deductions?.lateDeductions
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
                              salaryDetails?.deductions?.earlyDeductions
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
                              salaryDetails?.LeaveDeduction?.wLeaveDeduction
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-1">
                          <span className="text-gray-600">O Leave</span>
                          <span className="text-red-600">
                            -
                            {formatNumber(
                              salaryDetails?.LeaveDeduction?.oLeaveDeduction
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-1">
                          <span className="text-gray-600">S Leave</span>
                          <span className="text-red-600">
                            -
                            {formatNumber(
                              salaryDetails?.LeaveDeduction?.sLeaveDeduction
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

                  {/* Performance Metrics */}
                  <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Late Count</span>
                          <span className="font-medium">
                            {salaryDetails?.attendanceStats?.lateCount || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-yellow-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                (salaryDetails?.attendanceStats?.lateCount ||
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
                            {salaryDetails?.attendanceStats
                              ?.earlyDepartureCount || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-orange-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                (salaryDetails?.attendanceStats
                                  ?.earlyDepartureCount || 0) * 10,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Missed Punches</span>
                          <span className="font-medium">
                            {salaryDetails?.attendanceStats?.missedPunch || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-red-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                (salaryDetails?.attendanceStats?.missedPunch ||
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
                            {salaryDetails?.attendanceStats
                              ?.totalLatenessMinutes || 0}
                            m
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                (salaryDetails?.attendanceStats
                                  ?.totalLatenessMinutes || 0) / 10,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmployeeSalaryDetailsModal;
