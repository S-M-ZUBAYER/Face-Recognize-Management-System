// components/LoadingModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import useLeaveLoadingStore from "@/zustand/LeaveLoadingStore";

const STEP_CONFIG = {
  approved: [
    { label: "Updating employee salary rules", completeAt: 55 },
    { label: "Updating leave status", completeAt: 80 },
    { label: "Sending notification", completeAt: 100 },
  ],
  rejected: [
    { label: "Updating leave status", completeAt: 50 },
    { label: "Sending notification", completeAt: 100 },
  ],
  default: [
    { label: "Updating leave status", completeAt: 33 },
    { label: "Updating employee salary rules", completeAt: 66 },
    { label: "Sending notification", completeAt: 100 },
  ],
};

const LeaveLoadingModal = () => {
  const { isLoading, loadingMessage, loadingProgress, loadingType } =
    useLeaveLoadingStore();
  const steps = STEP_CONFIG[loadingType] || STEP_CONFIG.default;

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
                  {steps.map((step, index) => {
                    const isComplete = loadingProgress >= step.completeAt;

                    return (
                      <div key={step.label} className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isComplete ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-xs text-white">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            isComplete ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
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
