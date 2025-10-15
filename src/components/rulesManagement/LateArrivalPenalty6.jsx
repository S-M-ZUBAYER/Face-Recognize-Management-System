import { useState } from "react";

export const LateArrivalPenalty6 = () => {
  const [dayShiftPenalty, setDayShiftPenalty] = useState("");
  const [nightShiftPenalty, setNightShiftPenalty] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-2.5">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Day Shift Penalty</p>

              <input
                type="number"
                value={dayShiftPenalty}
                onChange={(e) => setDayShiftPenalty(e.target.value)}
                placeholder="Enter Amount (/Occurrence)"
                className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Night Shift Penalty</p>
              <input
                type="number"
                value={nightShiftPenalty}
                onChange={(e) => setNightShiftPenalty(e.target.value)}
                placeholder="Enter Amount (/Occurrence)"
                className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Set different lateness penalties based on shifts.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Example :</strong> Set day shift lateness penalty to 30
              and night shift lateness penalty to 20.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              If an employee is late 3 times during the day shift, the penalty
              will be 3 × 30 = 90.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              If an employee is late 2 times during the night shift, the penalty
              will be 2 × 20 = 40.
            </span>
          </li>
        </ul>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
