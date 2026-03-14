// components/LoadingModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import useLeaveLoadingStore from "@/zustand/LeaveLoadingStore";

const LeaveLoadingModal = () => {
  const { isLoading, loadingMessage, loadingProgress } = useLeaveLoadingStore();

  return (
    <AnimatePresence>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="relative z-50 w-full max-w-md mx-4"
          >
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <div className="flex flex-col items-center text-center">
                {/* Animated Icon */}
                <motion.div
                  animate={{
                    rotate: loadingProgress < 100 ? 360 : 0,
                  }}
                  transition={{
                    duration: 1,
                    repeat: loadingProgress < 100 ? Infinity : 0,
                    ease: "linear",
                  }}
                  className="mb-4"
                >
                  {loadingProgress < 100 ? (
                    <Loader2 className="w-12 h-12 text-blue-500" />
                  ) : (
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  )}
                </motion.div>

                {/* Message */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {loadingMessage || "Processing..."}
                </h3>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <motion.div
                    className="bg-blue-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Progress Percentage */}
                <p className="text-sm text-gray-500">
                  {loadingProgress}% Complete
                </p>

                {/* Steps */}
                <div className="w-full mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        loadingProgress >= 33 ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      {loadingProgress >= 33 ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-xs text-white">1</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        loadingProgress >= 33
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      Updating leave status
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        loadingProgress >= 66 ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      {loadingProgress >= 66 ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-xs text-white">2</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        loadingProgress >= 66
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      Updating employee salary rules
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        loadingProgress >= 100 ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      {loadingProgress >= 100 ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-xs text-white">3</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        loadingProgress >= 100
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      Sending notification
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LeaveLoadingModal;
