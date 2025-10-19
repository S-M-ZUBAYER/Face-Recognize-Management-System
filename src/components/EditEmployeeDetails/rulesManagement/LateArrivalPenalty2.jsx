export const LateArrivalPenalty2 = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Late &lt; Half Day = Deduct Half Day's Salary
            </h3>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800">
              Late &gt; Half Day = Deduct Full Day's Salary
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2 mb-1.5">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>If late before half day, deduct half day's salary.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>If late after half day, deduct full day's salary.</span>
          </li>
        </ul>

        <h4 className="text-sm font-semibold text-gray-900 mb-2">Example:</h4>
        <p className="text-sm text-gray-700">
          Suppose your company works from 08:00–12:00 in the morning and
          13:00–17:00 in the afternoon. If an employee is late between 08:00 and
          12:00, deduct half day's salary; if late after 12:00, deduct full
          day's salary. (Note: If absent without leave, treat as absenteeism.)
        </p>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
