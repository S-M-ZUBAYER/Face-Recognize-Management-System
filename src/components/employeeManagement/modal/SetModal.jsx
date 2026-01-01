import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Calendar, BookOpen } from "lucide-react";
import PayPeriodModal from "./PayPeriodModal";
import RulesModal from "./RulesModal";
import useSelectedEmployeeStore from "@/zustand/useSelectedEmployeeStore";
import { useUserStore } from "@/zustand/useUserStore";

function SetModal({ selectedEmployees: sEmployees }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPayPeriod, setShowPayPeriod] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const { setSelectedEmployees, clearSelection, selectedEmployees } =
    useSelectedEmployeeStore();
  const { clearRulesIds } = useUserStore();
  console.log(sEmployees, selectedEmployees);

  // Handle opening modal
  const handleOpen = () => {
    clearSelection();
    clearRulesIds();
    // Add employees to store
    if (Array.isArray(sEmployees)) {
      sEmployees.forEach((emp) => setSelectedEmployees(emp));
    } else {
      setSelectedEmployees(sEmployees);
    }
    setIsOpen(true);
  };

  // Handle closing modal
  const handleClose = () => {
    setIsOpen(false);
    clearSelection();
    clearRulesIds();
  };

  // Navigate to PayPeriod
  const handlePayPeriod = () => {
    setShowPayPeriod(true);
    setIsOpen(false);
  };

  // Navigate to Rules
  const handleRules = () => {
    setShowRules(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={handleOpen}
        // whileHover={{ scale: 1.1 }}
        // whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 border border-[#004368] text-[#004368] px-8 py-1 rounded-lg hover:bg-blue-50 font-bold"
        // title="Changes PayPeriod & Rules to selected employees"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
        >
          <path
            d="M6.12868 14.8713L14.8713 6.12868C15.2802 5.71974 15.4847 5.51527 15.594 5.2947C15.802 4.87504 15.802 4.38232 15.594 3.96265C15.4847 3.74209 15.2802 3.53761 14.8713 3.12868C14.4624 2.71974 14.2579 2.51528 14.0373 2.40597C13.6176 2.19801 13.125 2.19801 12.7053 2.40597C12.4847 2.51528 12.2802 2.71974 11.8713 3.12868L3.12868 11.8713C2.69513 12.3048 2.47836 12.5216 2.36418 12.7972C2.25 13.0729 2.25 13.3795 2.25 13.9926V15.7499H4.00736C4.62049 15.7499 4.92705 15.7499 5.20271 15.6358C5.47836 15.5216 5.69513 15.3048 6.12868 14.8713Z"
            stroke="#336986"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 15.75H13.5"
            stroke="#336986"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.875 4.125L13.875 7.125"
            stroke="#336986"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p>Edit PayPeriod & Rules</p>
      </motion.button>

      {/* Main Settings Modal */}
      <AnimatePresence>
        {isOpen && !showPayPeriod && !showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 300 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#004368] to-[#003050] p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Settings</h2>
                </div>
                <motion.button
                  onClick={handleClose}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                {/* Pay Period Button */}
                <motion.button
                  onClick={handlePayPeriod}
                  whileHover={{ x: 4, backgroundColor: "#f0f9ff" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 rounded-lg border-2 border-transparent hover:border-[#004368] hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                      <Calendar className="w-5 h-5 text-[#004368]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Pay Period</p>
                      <p className="text-xs text-gray-500">
                        Configure payment cycles
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Rules Button */}
                <motion.button
                  onClick={handleRules}
                  whileHover={{ x: 4, backgroundColor: "#f0f9ff" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 rounded-lg border-2 border-transparent hover:border-[#004368] hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 group-hover:bg-amber-200 rounded-lg transition-colors">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Rules</p>
                      <p className="text-xs text-gray-500">
                        Set salary rules and shifts
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Changes PayPeriod & Rules to selected employees
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PayPeriod Modal */}
      <PayPeriodModal
        isOpen={showPayPeriod}
        onCancel={() => {
          setShowPayPeriod(false);
          setIsOpen(true);
        }}
        onConfirm={() => {
          setShowPayPeriod(false);
          setIsOpen(true);
        }}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRules}
        onCancel={() => {
          setShowRules(false);
          setIsOpen(true);
        }}
        onConfirm={() => {
          setShowRules(false);
          setIsOpen(true);
        }}
      />
    </>
  );
}

export default SetModal;
