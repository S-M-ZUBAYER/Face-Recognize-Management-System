import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOverTimeData } from "@/hook/useOverTimeData";
import toast from "react-hot-toast";
import { useUserStore } from "@/zustand/useUserStore";

function OvertimeModal({ isOpen, onCancel, employeeId, deviceMAC }) {
  const { createOverTime, createLoading } = useOverTimeData();
  const { user } = useUserStore();

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const handleConfirm = () => {
    try {
      const requestBody = {
        deviceMAC,
        employeeId,
        startTime: startTime,
        endTime: endTime,
        date: new Date().toISOString().split("T")[0],
        duration: 0,
        reason: title,
        approvedBy: user?.userName || "",
        status: "Pending",
        paid: true,
      };

      createOverTime(requestBody);
      toast.success("Overtime created successfully");
      onCancel();
    } catch {
      toast.error("Overtime creation failed");
    }
  };

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
                {employeeId}
              </p>

              {/* Overtime Title */}
              <div>
                <label className="block text-gray-600 text-sm mb-1">
                  Overtime Title
                </label>
                <input
                  type="text"
                  placeholder="Overtime title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
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
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
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
                onClick={handleConfirm}
                disabled={createLoading}
                className="px-6 py-2 bg-[#004368] text-white rounded-md disabled:opacity-50"
              >
                {createLoading ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OvertimeModal;
