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

      <div>
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <div className="space-y-3.5">
          <p className="text-sm font-semibold">
            Flexible Working Hours Settings
          </p>
          <p className="text-sm text-gray-500">
            <strong className="text-sm font-semibold mb-2">Example: </strong>
            if you set late arrival by 1 minute and late leave by 2 minutes, for
            example, if the work start time is 08:00 and the end time is 17:00,
            arriving at 08:01 means leaving at 17:02. Similarly, arriving at
            08:10 means leaving at 17:20,based on company policy this can also
            be set 1:1.
          </p>
        </div>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
