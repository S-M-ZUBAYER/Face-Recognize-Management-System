export const FlexibleWork = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between">
        <label>Late (Minutes) </label>
        <input
          type="number"
          placeholder="Enter Time (Minutes)"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-3.5 items-center justify-between">
        <label>Leave Late (Minutes) </label>
        <input
          type="number"
          placeholder="Enter Time (Minutes)"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Flexible Working Hours Settings</strong>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> if you set late arrival by 1 minute and
              late leave by 2 minutes, for example, if the work start time is
              08:00 and the end time is 17:00, arriving at 08:01 means leaving
              at 17:02. Similarly, arriving at 08:10 means leaving at
              17:20,based on company policy this can also be set 1:1.
            </span>
          </li>
        </ul>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
