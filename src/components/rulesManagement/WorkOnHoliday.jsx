import { useState } from "react";
import { Calendar } from "../ui/calendar";

export const WorkOnHoliday = () => {
  const [specialDates, setSpecialDates] = useState([]);

  return (
    <div className="space-y-6">
      <div className="mt-4 mx-[8vw]">
        <Calendar
          mode="multiple"
          selected={specialDates}
          onSelect={setSpecialDates}
          className=" w-[25vw]  "
          modifiersStyles={{
            today: {
              backgroundColor: "transparent",
              color: "inherit",
            },
          }}
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <div className="space-y-2.5">
          <p className="text-sm text-gray-500">
            when a national holiday shifts, some weekends become regular
            workdays. Select these dates to indicate that attendance is
            required. Click the date and it will turn blue to indicate
            selection. The selection will be automatically saved.
          </p>
        </div>
      </div>
      <button className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
