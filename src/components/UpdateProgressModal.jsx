// components/UpdateProgressModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, Loader } from "lucide-react";
import useUpdateProgressStore from "@/zustand/updateProgressStore";

const UpdateProgressModal = () => {
  const {
    isModalOpen,
    totalEmployees,
    processedEmployees,
    successfulEmployees,
    failedEmployees,
    currentProcessingEmployee,
    closeModal,
    title,
  } = useUpdateProgressStore();

  const progress = (processedEmployees / totalEmployees) * 100;
  const isComplete =
    processedEmployees === totalEmployees && totalEmployees > 0;

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       bg-white rounded-xl shadow-2xl p-6 w-full max-w-md z-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Updating {title}
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>
                  {processedEmployees} of {totalEmployees}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>

            {/* Current Processing */}
            {currentProcessingEmployee && !isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2"
              >
                <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm text-blue-700">
                  Processing: {currentProcessingEmployee}
                </span>
              </motion.div>
            )}

            {/* Results */}
            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {/* Successful */}
              {successfulEmployees.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
                    <CheckCircle size={16} />
                    Successful ({successfulEmployees.length})
                  </h4>
                  <div className="space-y-1">
                    {successfulEmployees.map((name, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-sm text-gray-600 bg-green-50 p-2 rounded"
                      >
                        {name}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Failed */}
              {failedEmployees.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                    <XCircle size={16} />
                    Failed ({failedEmployees.length})
                  </h4>
                  <div className="space-y-1">
                    {failedEmployees.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-sm text-gray-600 bg-red-50 p-2 rounded"
                      >
                        <div className="font-medium">{item.name}</div>
                        {item.error && (
                          <div className="text-xs text-red-500 mt-1">
                            {item.error}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Completion Message */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-green-50 rounded-lg text-center"
              >
                <p className="text-green-700 font-medium">
                  {failedEmployees.length === 0
                    ? `All ${title} updated successfully! 🎉`
                    : `Completed with ${failedEmployees.length} failure(s)`}
                </p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpdateProgressModal;
