import useAlertDialog from "@/zustand/useAlertDialog";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function AlertDialog() {
  const { isOpen, dialogMessage, closeDialog } = useAlertDialog();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50 "
          onClick={() => closeDialog()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => closeDialog()}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Message Content */}
            <div className="pr-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Alert
              </h2>
              <p className="text-gray-700 text-sm leading-6">{dialogMessage}</p>
            </div>

            {/* Action Button */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => closeDialog()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AlertDialog;
