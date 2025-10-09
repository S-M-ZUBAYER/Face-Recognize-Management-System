import RuleHeader from "./RuleHeader";
import { Plus } from "lucide-react";

export const HolidayForm = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <RuleHeader title="Select Holiday" onBack={onBack} />

      <div>
        <label className="block text-sm font-semibold mb-3">
          Holiday Calendar
        </label>
        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
          <option>Select holiday calendar</option>
          <option>National Holidays</option>
          <option>Company Holidays</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3">
          Custom Holidays
        </label>
        <div className="space-y-2">
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
            <Plus className="w-4 h-4" />
            Add Holiday
          </button>
        </div>
      </div>

      <button className="w-full py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
