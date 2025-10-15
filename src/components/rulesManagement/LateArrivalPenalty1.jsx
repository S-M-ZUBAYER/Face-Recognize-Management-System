import { useState } from "react";

export const LateArrivalPenalty1 = () => {
  const [penaltyAmount, setPenaltyAmount] = useState("");

  return (
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Late Penalty
          </p>
          <input
            type="number"
            value={penaltyAmount}
            onChange={(e) => setPenaltyAmount(e.target.value)}
            placeholder="Penalty Per Occurrence"
            className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Deduct a fixed amount for each late occurrence</strong>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> If the penalty is set to 50 per
              occurrence and an employee is late 3 times, the penalty amount =
              50 × 3 = 150.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>Click the save button after setting.</span>
          </li>
        </ul>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
