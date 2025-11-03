import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import EmployeeList from "./EmployeeList";

function EmployeeSelectionModal() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div
        className="mb-4 cursor-pointer w-[18.5vw] "
        onClick={() => setIsOpen(true)}
      >
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between">
          <p className="text-gray-600">Select Employee for Salary Rules</p>
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
            className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-[65vw] h-[85vh] flex flex-col relative "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 absolute top-2 right-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Content */}
              <div className="flex flex-1 min-h-0 p-6">
                <EmployeeList />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default EmployeeSelectionModal;
