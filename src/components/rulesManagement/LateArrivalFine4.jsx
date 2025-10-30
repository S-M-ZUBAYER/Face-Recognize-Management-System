import { useState } from "react";

export const LateArrivalFine4 = () => {
  const [latenessTime, setLatenessTime] = useState("");
  const [fixedPenalty, setFixedPenalty] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-gray-600">Lateness Time</p>
            <input
              type="number"
              value={latenessTime}
              onChange={(e) => setLatenessTime(e.target.value)}
              placeholder="Enter Time (Minutes)"
              className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="p-4 border border-gray-200 rounded-lg flex justify-between items-center ">
            <p className="text-sm text-gray-600">Fixed Penalty</p>
            <input
              type="number"
              value={fixedPenalty}
              onChange={(e) => setFixedPenalty(e.target.value)}
              placeholder="Fixed Penalty"
              className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Implement a fixed penalty amount for employees who exceed this
              lateness time in a month (one attendance cycle).
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Example:</strong> Set time to 30 minutes and fixed penalty
              to 150. If an employee exceeds 30 minutes of total lateness in a
              month (one attendance cycle), deduct a fixed penalty of 150.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>No penalty for lateness within this time.</span>
          </li>
        </ul>
      </div>

      <hr className="border-gray-200" />

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
