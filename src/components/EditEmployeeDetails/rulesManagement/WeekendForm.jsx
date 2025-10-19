import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              Select weekends,click the day to choose it as a weekend.When it
              shows as checked,it means the day is selected,and there will be no
              attendance required on that weekend. The selection will be
              automatically saved.
            </span>
          </li>
        </ul>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg  transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
