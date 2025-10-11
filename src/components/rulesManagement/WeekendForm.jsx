export const WeekendForm = () => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-3">Weekend Days</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day) => (
            <label key={day} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-teal-600" />
              <span className="text-sm">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="w-full py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
