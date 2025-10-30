import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const SelectOvertime = () => {
  const [allowOvertime, setAllowOvertime] = useState("No");
  const [multiplier, setMultiplier] = useState("1");

  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">Allow Overtime</span>
            <RadioGroup
              value={allowOvertime}
              onValueChange={setAllowOvertime}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Yes" id="yes-overtime" />
                <Label htmlFor="yes-overtime">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="No" id="no-overtime" />
                <Label htmlFor="no-overtime">No</Label>
              </div>
            </RadioGroup>
          </div>

          {allowOvertime === "Yes" && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Overtime Multiplier
              </h3>
              <input
                type="number"
                step="0.1"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="1.5"
                className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              If you select yes, allow employees to work overtime and enter the
              overtime pay multiplier here. For example, if set to 1.5,
              calculate the employee's hourly base salary × 1.5 to find the
              regular overtime pay per hour.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              If you select no, overtime pay will not be calculated from the
              card.
            </span>
          </li>
        </ul>
      </div>

      <hr className="border-gray-200" />

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
