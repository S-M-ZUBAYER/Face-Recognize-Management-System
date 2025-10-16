export const LatenessForm = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between">
        <label>Late time setting</label>
        <input
          type="number"
          placeholder="Enter last time of late count"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Lateness Warning System</strong>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> if set to 5, and the start time is
              08:00,lateness starts from 08:05,providing a 5-minute grace period
              as a benefit to employees
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
