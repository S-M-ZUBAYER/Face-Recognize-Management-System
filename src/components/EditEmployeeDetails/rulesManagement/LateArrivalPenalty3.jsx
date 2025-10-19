import { useState } from "react";

export const LateArrivalPenalty3 = () => {
  const [hourlyRate, setHourlyRate] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Total Lateness Time</p>
                <input
                  type="number"
                  value={1}
                  placeholder="Enter Amount (/Hour)"
                  className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600"> Hourly Late Penalty</p>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="Enter Amount (/Hour)"
                  className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Set the penalty amount per hour of lateness.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Example:</strong> If the hourly rate is set to 60, and an
              employee is late for 30 minutes in a month (one attendance cycle),
              the deduction will be 30; similarly calculated for total lateness
              time.
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
