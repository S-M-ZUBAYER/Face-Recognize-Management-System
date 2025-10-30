export const UseOverTimeLateness = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between">
        <label>Late Time </label>
        <input
          type="number"
          placeholder="Enter Time (Minutes)"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-3.5 items-center justify-between">
        <label>Cost Over Time </label>
        <input
          type="number"
          placeholder="Enter Cost Over Time Minutes"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Replace lateness time with overtime</strong>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> The rule is to replace lateness first
              with holiday overtime,if not available then with weekend
              overtime.For example,if lateness is set to 1 minute and overtime
              replacement is also 1 minute,and the start time is 08:00,arriving
              at 08:10 means 10 minutes of lateness, and if there are 120
              minutes of holiday overtime,it will be reduced to 110 minutes.
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
