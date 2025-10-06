import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const EmployeeSalaryDetailsModal = ({ selectedEmp, setSelectedEmp }) => {
  // Debug log to check if selectedEmp is received
  console.log("Modal selectedEmp:", selectedEmp);

  return (
    <AnimatePresence>
      {selectedEmp && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop blur */}
          <motion.div
            className="absolute inset-0 bg-black/5 backdrop-blur-sm"
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(4px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            onClick={() => setSelectedEmp(null)}
          />

          {/* Modal box */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-xl w-[90vw] max-w-2xl p-6 z-10 overflow-y-auto max-h-[90vh]"
            initial={{
              scale: 0.8,
              opacity: 0,
              y: 50,
              rotateX: -10,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              rotateX: 0,
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
              y: 50,
              rotateX: 10,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <motion.h2
              className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Employee Details
            </motion.h2>

            {/* Basic Info */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p>
                <strong>Name:</strong> {selectedEmp?.name?.split("<")[0]}
              </p>
              <p>
                <strong>Email:</strong> {selectedEmp?.email}
              </p>
              <p>
                <strong>Employee ID:</strong> {selectedEmp?.companyEmployeeId}
              </p>
              <p>
                <strong>Department:</strong> {selectedEmp?.department}
              </p>
              <p>
                <strong>Designation:</strong> {selectedEmp?.designation}
              </p>
              <p>
                <strong>Device MAC:</strong> {selectedEmp?.deviceMAC}
              </p>
              <p>
                <strong>Shift:</strong> {selectedEmp?.salaryInfo?.shift}
              </p>
              <p>
                <strong>Pay Period:</strong>{" "}
                {selectedEmp?.salaryInfo?.payPeriod}
              </p>
            </motion.div>

            {/* Salary Info */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-4 border-t pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p>
                <strong>Salary:</strong> {selectedEmp.salary}
              </p>
              <p>
                <strong>Hourly Rate:</strong>{" "}
                {selectedEmp.salaryInfo?.overtimeSalary}
              </p>
              <p>
                <strong>Shift:</strong> {selectedEmp.salaryInfo?.shift}
              </p>
              <p>
                <strong>Total Pay:</strong>{" "}
                {selectedEmp?.salaryDetails?.totalPay || 0}
              </p>
              <p>
                <strong>Present Days:</strong>{" "}
                {Object.values(selectedEmp.salaryDetails?.Present || {}).reduce(
                  (sum, val) => sum + (val || 0),
                  0
                )}
              </p>
              <p>
                <strong>Absent:</strong>{" "}
                {selectedEmp?.salaryDetails?.absent || 0}
              </p>

              <div className="mb-2">
                <strong>Overtime Details:</strong>
                <motion.ul className="ml-4 list-disc">
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Holiday:{" "}
                    {selectedEmp?.salaryDetails?.overtimeDetails?.holiday || 0}
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Normal:{" "}
                    {selectedEmp?.salaryDetails?.overtimeDetails?.normal || 0}
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    Weekend:{" "}
                    {selectedEmp?.salaryDetails?.overtimeDetails?.weekend || 0}
                  </motion.li>
                </motion.ul>
              </div>

              <div className="mb-2">
                <strong>Present Details:</strong>
                <motion.ul className="ml-4 list-disc">
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Holiday:{" "}
                    {selectedEmp?.salaryDetails?.Present?.holidayPresent || 0}
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Normal:{" "}
                    {selectedEmp?.salaryDetails?.Present?.normalPresent || 0}
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    Weekend:{" "}
                    {selectedEmp?.salaryDetails?.Present?.weekendPresent || 0}
                  </motion.li>
                </motion.ul>
              </div>

              <p>
                <strong>Overtime Salary:</strong>{" "}
                {selectedEmp?.salaryDetails?.overtimePay || 0}
              </p>
            </motion.div>

            {/* Attendance Stats */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-4 border-t pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p>
                <strong>Early Departures:</strong>{" "}
                {selectedEmp?.salaryDetails?.attendanceStats
                  ?.earlyDepartureCount || 0}
              </p>
              <p>
                <strong>Late Count:</strong>{" "}
                {selectedEmp?.salaryDetails?.attendanceStats?.lateCount || 0}
              </p>
              <p>
                <strong>Missed Punch:</strong>{" "}
                {selectedEmp?.salaryDetails?.attendanceStats?.missedPunch || 0}
              </p>
              <p>
                <strong>Total Lateness Hours:</strong>{" "}
                {selectedEmp?.salaryDetails?.attendanceStats
                  ?.totalLatenessHours || 0}
              </p>
            </motion.div>

            {/* Close button */}
            <motion.div
              className="flex justify-end mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.button
                onClick={() => setSelectedEmp(null)}
                className="px-6 py-3 bg-[#004368] text-white rounded-lg shadow-lg font-medium"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#003050",
                  boxShadow: "0 10px 25px rgba(0, 67, 104, 0.3)",
                }}
                whileTap={{
                  scale: 0.95,
                  boxShadow: "0 5px 15px rgba(0, 67, 104, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmployeeSalaryDetailsModal;
