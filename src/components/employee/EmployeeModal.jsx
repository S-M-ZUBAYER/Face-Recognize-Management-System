import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -50,
    transition: {
      duration: 0.3,
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

const EmployeeModal = ({ selectedEmp, setSelectedEmp }) => {
  if (!selectedEmp) return null;

  const basicInfoFields = [
    { label: "Name", value: selectedEmp?.name?.split("<")[0] },
    { label: "Email", value: selectedEmp?.email },
    { label: "Employee ID", value: selectedEmp?.companyEmployeeId },
    { label: "Department", value: selectedEmp?.department },
    { label: "Designation", value: selectedEmp?.designation },
    { label: "Device MAC", value: selectedEmp?.deviceMAC },
    { label: "Shift", value: selectedEmp?.salaryInfo?.shift },
    { label: "Pay Period", value: selectedEmp?.salaryInfo?.payPeriod },
  ];

  const salaryInfoFields = [
    { label: "Salary", value: selectedEmp?.salaryInfo?.salary },
    { label: "Hourly Rate", value: selectedEmp?.salaryInfo?.overtimeSalary },
    { label: "Shift", value: selectedEmp?.salaryInfo?.shift },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Backdrop blur */}
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0  backdrop-blur-sm"
          onClick={() => setSelectedEmp(null)}
        />

        {/* Modal box */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#004368] to-[#0066a1] p-6">
            <motion.h2
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Employee Details
            </motion.h2>
            <motion.p
              className="text-blue-100 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Complete information about {selectedEmp?.name?.split("<")[0]}
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Basic Info Section */}
            <motion.section
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {basicInfoFields.map((field, index) => (
                  <motion.div
                    key={field.label}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(0, 67, 104, 0.05)",
                    }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <p className="text-sm font-medium text-gray-600">
                      {field.label}
                    </p>
                    <p className="text-gray-800 font-semibold mt-1">
                      {field.value || "N/A"}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Salary Info Section */}
            <motion.section
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Salary Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {salaryInfoFields.map((field, index) => (
                  <motion.div
                    key={field.label}
                    custom={index + basicInfoFields.length}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-green-50 rounded-lg p-3 border border-green-200"
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(34, 197, 94, 0.05)",
                    }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <p className="text-sm font-medium text-gray-600">
                      {field.label}
                    </p>
                    <p className="text-gray-800 font-semibold mt-1">
                      {field.value || "N/A"}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Additional sections can be added here */}
            {/* You can add Attendance Stats, Overtime Details, etc. */}
          </div>

          {/* Footer with close button */}
          <motion.div
            className="border-t border-gray-200 p-4 bg-gray-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-end">
              <motion.button
                onClick={() => setSelectedEmp(null)}
                className="px-6 py-2 bg-[#004368] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#0066a1",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <svg
                  className="w-4 h-4"
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
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmployeeModal;
