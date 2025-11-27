import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const EmployeeSalaryDetailsModal = ({ selectedEmp, setSelectedEmp }) => {
  const salaryDetails = selectedEmp?.salaryDetails;

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
                  <p className="text-gray-300 mt-1">
                    {selectedEmp?.designation} • {selectedEmp?.department}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
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
                  {/* Total Pay Card */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          Total Pay
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {salaryDetails?.totalPay || 0}
                        </p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-xl">
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Standard Pay */}
                  <div className="bg-gray-50 p-5 rounded-2xl border">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">
                        Standard Pay
                      </h3>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {salaryDetails?.standardPay || 0}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Base salary before adjustments
                    </p>
                  </div>

                  {/* Overtime Earnings */}
                  <div className="bg-gray-50 p-5 rounded-2xl border">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">Overtime</h3>
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        +{salaryDetails?.overtimePay || 0}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Normal:</span>
                        <span>
                          {salaryDetails?.overtimeDetails?.normal || 0}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weekend:</span>
                        <span>
                          {salaryDetails?.overtimeDetails?.weekend || 0}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Holiday:</span>
                        <span>
                          {salaryDetails?.overtimeDetails?.holiday || 0}h
                        </span>
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
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Attendance Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">
                          {salaryDetails?.Present?.normalPresent || 0}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Normal Days
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600">
                          {salaryDetails?.Present?.holidayPresent || 0}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Holiday Days
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">
                          {salaryDetails?.Present?.weekendPresent || 0}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Weekend Days
                        </div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-xl">
                        <div className="text-2xl font-bold text-red-600">
                          {salaryDetails?.absent || 0}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Absent Days
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Work Schedule */}
                  <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Work Schedule
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">
                          Total Working Days
                        </span>
                        <span className="font-semibold">
                          {salaryDetails?.workingDays || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Worked Up To Date</span>
                        <span className="font-semibold">
                          {salaryDetails?.workingDaysUpToCurrent || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Pay Period</span>
                        <span className="font-semibold">
                          {selectedEmp?.salaryInfo?.payPeriod}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Column 3 - Deductions & Analytics */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Deductions Summary */}
                  <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Deductions Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Absent</span>
                        <span className="text-red-600 font-semibold">
                          -{salaryDetails?.deductions?.absentDeductions || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Missed Punches</span>
                        <span className="text-red-600 font-semibold">
                          -
                          {salaryDetails?.deductions?.missedPunchDeductions ||
                            0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Late Arrivals</span>
                        <span className="text-red-600 font-semibold">
                          -{salaryDetails?.deductions?.lateDeductions || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Early Departures</span>
                        <span className="text-red-600 font-semibold">
                          -{salaryDetails?.deductions?.earlyDeductions || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Late Count</span>
                          <span className="font-medium">
                            {salaryDetails?.attendanceStats?.lateCount || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
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
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            Early Departures
                          </span>
                          <span className="font-medium">
                            {salaryDetails?.attendanceStats
                              ?.earlyDepartureCount || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
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
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Missed Punches</span>
                          <span className="font-medium">
                            {salaryDetails?.attendanceStats?.missedPunch || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
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
                    </div>
                  </div>

                  {/* Monthly Breakdown */}
                  <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Monthly Breakdown
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">
                          {salaryDetails?.monthlyDetails?.thisMonthHolidays ||
                            0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Holidays
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {salaryDetails?.monthlyDetails?.thisMonthLeave || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Leaves</div>
                      </div>
                      <div className="p-3 bg-cyan-50 rounded-lg">
                        <div className="text-lg font-bold text-cyan-600">
                          {salaryDetails?.monthlyDetails?.thisMonthWeekends ||
                            0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Weekends
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
