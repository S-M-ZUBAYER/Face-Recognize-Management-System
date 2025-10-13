export const HolidayOvertime = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between">
        <label>Holiday Working Time Percent </label>
        <input
          type="number"
          placeholder="Enter working time percent"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-3.5 items-center justify-between">
        <label>Holiday Overtime Percent</label>
        <input
          type="number"
          placeholder="Enter overtime percent"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <div className="space-y-3.5">
          <p className="text-sm text-gray-500">
            Holiday working time percent : daily total working hours without
            overtime, if we want, we can increase it on weekend.
          </p>
          <p className="text-sm text-gray-500">
            Holiday overtime time percent : daily total overtime hours, if we
            want,we can increase it on weekend.
          </p>
          <p className="text-sm text-gray-500">
            <strong className="text-sm font-semibold mb-2">Example: </strong>
            if an employee works 2 days with per day salary of 500 and the
            multiplier is set to 2 holiday.working time pay = Holiday working
            days *500*2=2*500*2=2000
          </p>
          <p className="text-sm text-gray-500">
            <strong className="text-sm font-semibold mb-2">Example: </strong>
            if an employee works 2 hours overtime in weekend with 100/hour and
            the multiplier is set to 3.Holiday overtime pay = overtime hour
            *100*3=2*100*3=600
          </p>
        </div>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
