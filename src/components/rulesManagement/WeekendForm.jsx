import { useState } from "react";
import { Checkbox } from "../ui/checkbox";

export const WeekendForm = () => {
  const [selectedDays, setSelectedDays] = useState([]);

  const handleDayChange = (day, checked) => {
    if (checked) {
      setSelectedDays((prev) => [...prev, day]);
    } else {
      setSelectedDays((prev) => prev.filter((d) => d !== day));
    }
  };

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-3">Weekend Days</label>
        <div className="space-y-3">
          {daysOfWeek.map((day) => (
            <label key={day} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedDays.includes(day)}
                onCheckedChange={(checked) => handleDayChange(day, checked)}
                className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
              />
              <span className="text-sm">{day}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Optional: Show selected days for debugging */}
      <div className="text-sm text-gray-600">
        Selected days: {selectedDays.join(", ") || "None"}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <div className="space-y-2.5">
          <p className="text-sm text-gray-500">
            Select weekends,click the day to choose it as a weekend.When it
            shows as checked,it means the day is selected,and there will be no
            attendance required on that weekend. The selection will be
            automatically saved.
          </p>
        </div>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg  transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
