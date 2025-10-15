export const OvertImeCount = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between">
        <label>Minimum OverTime Unit (Minutes)</label>
        <input
          type="number"
          placeholder="Minimum OverTime Unit (Minutes)"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <p>Minimum overTime unit</p>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong>{" "}
              {`Set to 30 minutes. if the employee's overtime is 20 minutes, the calculated overtime is 0.if the work is >=30 minutes and <60 minutes, the overtime will be 30 minutes.Similarly calculated.`}
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
