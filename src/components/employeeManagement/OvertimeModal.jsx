import { motion, AnimatePresence } from "framer-motion";

function OvertimeModal({ isOpen, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-center text-lg font-semibold mb-4">
              Selected Options
            </h2>

            <div className="space-y-2 text-sm text-gray-800">
              <p>
                <span className="font-semibold">Selected Employee ID:</span>{" "}
                [2109058927]
              </p>
              <p>
                <span className="font-semibold">Work Type:</span> None
              </p>
              <p>
                <span className="font-semibold">Attendance Method:</span> None
              </p>
              <p>
                <span className="font-semibold">Visible Info:</span> None
              </p>
              <p>
                <span className="font-semibold">Overtime:</span> Yes
              </p>
              <p>
                <span className="font-semibold">NeedMove:</span> None
              </p>

              {/* Overtime Title */}
              <div>
                <label className="block text-gray-600 text-sm mb-1">
                  Overtime Title
                </label>
                <input
                  type="text"
                  placeholder="Overtime title"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004368]"
                />
              </div>

              {/* Start & End Time */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-gray-600 text-sm mb-1">
                    Start Time
                  </label>
                  <div className="flex items-center border rounded-md px-3 py-2 text-sm text-gray-500">
                    <input
                      type="time"
                      className="w-full focus:outline-none"
                      defaultValue="09:00"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-gray-600 text-sm mb-1">
                    End Time
                  </label>
                  <div className="flex items-center border rounded-md px-3 py-2 text-sm text-gray-500">
                    <input
                      type="time"
                      className="w-full focus:outline-none"
                      defaultValue="18:00"
                    />
                  </div>
                </div>
              </div>

              <p>
                <span className="font-semibold">PayPeriod</span> false
              </p>
              <p>
                <span className="font-semibold">Salary Rules</span> false
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-[#004368] text-[#004368] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 bg-[#004368] text-white rounded-md"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OvertimeModal;
