export const AbsenceForm = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between">
        <label>Leave Day</label>
        <input
          type="number"
          placeholder="Enter Penalty Days"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <div className="space-y-3.5">
          <p className="text-sm text-gray-500">
            Deduct how many day's salary for each absence.
          </p>
          <p className="text-sm text-gray-500">
            if the penalty days are set to 3, one day's absence will result in a
            deduction of 3 day's salary.
          </p>
        </div>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
