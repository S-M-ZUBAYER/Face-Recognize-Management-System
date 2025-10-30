import { useState } from "react";

export const SetTotalLeaveDays = () => {
  const [leaveDays, setLeaveDays] = useState({
    "Maternity Leave": "",
    "Marriage Leave": "",
    "Paternity Leave": "",
    "Sick Leave": "",
    "Casual Leave": "",
    "Earned Leave": "",
    "Without Pay Leave": "",
    "Rest Leave": "",
    Others: "",
  });

  const handleLeaveDayChange = (leaveType, value) => {
    setLeaveDays((prev) => ({
      ...prev,
      [leaveType]: value,
    }));
  };

  const leaveCategories = [
    "Maternity Leave",
    "Marriage Leave",
    "Paternity Leave",
    "Sick Leave",
    "Casual Leave",
    "Earned Leave",
    "Without Pay Leave",
    "Rest Leave",
    "Others",
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <span className="text-sm text-gray-700">Days</span>
          </div>
          <div className="flex justify-end">
            <input
              type="number"
              placeholder="0"
              className="w-50 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right"
            />
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Leave Categories
        </h3>
        <div className="space-y-3">
          {leaveCategories.map((category) => (
            <div key={category} className="grid grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-sm text-gray-700">{category}</span>
              </div>
              <div className="flex justify-end">
                <input
                  type="number"
                  value={leaveDays[category]}
                  onChange={(e) =>
                    handleLeaveDayChange(category, e.target.value)
                  }
                  placeholder="0"
                  className="w-50 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <p>
          Total leave count means all the days you can take off in a year. It
          includes vacation days, public holidays, sick leave, and other special
          leaves.The exact number depends on your country's laws and your
          company's rules.
        </p>
        <p>You can either</p>
        <p>
          Enter values in leave categories (total will be calculated
          automatically),or Enter the total leaves directly (all categories will
          be reset to 0)
        </p>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
