import { useState } from "react";
import RulesSidebar from "./rulesManagement/RulesSidebar";
import { RuleContent } from "./rulesManagement/RuleContent";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import AlertDialog from "../AlertDialog";

const EditRules = () => {
  const [selectedRule, setSelectedRule] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const rules = [
    { id: 0, title: "Select work shift time", component: "workShift" },
    { id: 1, title: "Select holiday", component: "holiday" },
    { id: 2, title: "Select weekend", component: "weekend" },
    {
      id: 3,
      title: "Work on holidays instead of other day",
      component: "workOnHoliday",
    },
    { id: 4, title: "Lateness warning system", component: "lateness" },
    { id: 5, title: "Flexible work settings", component: "flexible" },
    {
      id: 6,
      title: "Use overtime to offset being late",
      component: "overtimeOffset",
    },
    { id: 7, title: "Overtime does not count", component: "overtimeCount" },
    { id: 8, title: "Weekend overtime", component: "weekendOvertime" },
    { id: 9, title: "Holiday overtime", component: "holidayOvertime" },
    { id: 10, title: "Ask for leave", component: "leave" },
    { id: 11, title: "Special time documents", component: "specialTime" },
    { id: 12, title: "Replacement day", component: "replacement" },
    { id: 13, title: "Absence from work penalty", component: "absence" },
    {
      id: 14,
      title: "Piece-rate pay with leave impact",
      component: "pieceRate",
    },
    { id: 15, title: "Late arrival penalty-1", component: "lateArrival" },
    { id: 16, title: "Early departure deduction", component: "earlyDeparture" },
    { id: 17, title: "Late arrival Penalty-2", component: "lateArrival2" },
    { id: 18, title: "Late arrival Penalty-3", component: "lateArrival3" },
    { id: 19, title: "Late arrival fine-4", component: "lateArrival4" },
    { id: 20, title: "Late arrival fine-5", component: "lateArrival5" },
    { id: 21, title: "Late arrival Penalty-6", component: "lateArrival6" },
    { id: 22, title: "Missed Punch", component: "missedPunch" },
    { id: 23, title: "Select Overtime", component: "selectOvertime" },
    { id: 24, title: "Set Total Leave Days", component: "setTotalLeaveDays" },
  ];

  const handleRuleSelect = (rule) => {
    setSelectedRule(rule);
  };

  const handleBack = () => {
    setSelectedRule(null);
  };

  return (
    <>
      <div className="mb-4 cursor-pointer" onClick={() => setIsOpen(true)}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rules
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between">
          <p className="text-gray-600">Salary Rules</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <path
              d="M6.75004 4.5C6.75004 4.5 11.25 7.81417 11.25 9C11.25 10.1859 6.75 13.5 6.75 13.5"
              stroke="#004368"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50 "
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-[65vw] max-h-[90vh] overflow-y-auto p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* === Cancel Button === */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex gap-3">
                <RulesSidebar
                  rules={rules}
                  selectedRule={selectedRule}
                  onRuleSelect={handleRuleSelect}
                />
                <RuleContent selectedRule={selectedRule} onBack={handleBack} />
                <AlertDialog />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditRules;
