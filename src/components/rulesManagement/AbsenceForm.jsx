export const AbsenceForm = () => {
  return (
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-800 mb-2">Leave Day</p>
          <input
            type="number"
            placeholder="Enter Penalty Days"
            className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Deduct how many day's salary for each absence.</strong>
            </span>
          </li>

          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              if the penalty days are set to 3, one day's absence will result in
              a deduction of 3 day's salary.
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
