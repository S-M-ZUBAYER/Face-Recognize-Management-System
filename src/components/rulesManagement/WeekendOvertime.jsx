export const WeekendOvertime = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between">
        <label>Weekend Working Time Percent </label>
        <input
          type="number"
          placeholder="Enter working time percent"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-3.5 items-center justify-between">
        <label>Weekend Overtime Percent</label>
        <input
          type="number"
          placeholder="Enter overtime percent"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <p>
                Weekend working time percent : daily total working hours without
                overtime, if we want, we can increase it on weekend.
              </p>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <p>
                Weekend overtime time percent : daily total overtime hours, if
                we want,we can increase it on weekend.
              </p>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> if an employee works 2 days with per day
              salary of 500 and the multiplier is set to 2 weekend.working time
              pay = Weekend working days *500*2=2*500*2=2000
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> if an employee works 2 hours overtime in
              weekend with 100/hour and the multiplier is set to 3.weekend
              overtime pay = overtime hour *100*3=2*100*3=600
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
