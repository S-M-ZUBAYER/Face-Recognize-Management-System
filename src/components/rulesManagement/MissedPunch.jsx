import { useState } from "react";

export const MissedPunch = () => {
  const [costPerMissedPunch, setCostPerMissedPunch] = useState("0");
  const [missAcceptableTime, setMissAcceptableTime] = useState("0");

  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 text-center ">
              Cost Per Missed Punch
            </h3>
            <input
              type="number"
              value={costPerMissedPunch}
              onChange={(e) => setCostPerMissedPunch(e.target.value)}
              className="w-50 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="p-4 border border-gray-200 rounded-lg flex justify-between  items-center ">
            <h3 className="text-sm font-semibold text-gray-800 ">
              Miss acceptable time
            </h3>
            <input
              type="number"
              value={missAcceptableTime}
              onChange={(e) => setMissAcceptableTime(e.target.value)}
              className="w-50 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
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
              If you miss punching more than the set times, a penalty will be
              deducted.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              If the missed punch cost is set to 30 and the acceptable times are
              set to 3, and an employee misses punching 4 times in a month (one
              attendance cycle), the deduction will be (4-3) × 30 = 30; no
              deduction for 3 or fewer times.
            </span>
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
