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

      <div>
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <div className="space-y-3.5">
          <p className="text-sm text-gray-500">Minimum overTime unit</p>
          <p className="text-sm text-gray-500">
            <strong className="text-sm font-semibold mb-2">Example:</strong>
            {`Set to 30 minutes. if the employee's overtime is 20 minutes, the calculated overtime is 0.if the work is >=30 minutes and <60 minutes, the overtime will be 30 minutes.Similarly calculated.`}
          </p>
        </div>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
