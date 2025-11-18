import { useState } from "react";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useEmployees } from "@/hook/useEmployees";

export const HolidayOvertime = () => {
  const [holidayOvertimePercent, setHolidayOvertimePercent] = useState("");
  const [holidayWorkingTimePercent, setHolidayWorkingTimePercent] =
    useState("");
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  const { Employees } = useEmployees();

  // Save holiday overtime configuration
  const handleSave = async () => {
    if (Employees.length === 0) {
      toast.error("Please select at least one employee!");
      return;
    }

    if (
      !holidayOvertimePercent ||
      isNaN(holidayOvertimePercent) ||
      parseFloat(holidayOvertimePercent) < 0
    ) {
      toast.error(
        "Please enter a valid positive number for holiday overtime percent"
      );
      return;
    }

    if (
      !holidayWorkingTimePercent ||
      isNaN(holidayWorkingTimePercent) ||
      parseFloat(holidayWorkingTimePercent) < 0
    ) {
      toast.error(
        "Please enter a valid positive number for holiday working time percent"
      );
      return;
    }

    try {
      const updatePromises = Employees.map(async (selectedEmployee) => {
        if (!selectedEmployee?.employeeId) {
          toast.error("No employee selected");
          return;
        }
        const salaryRules = selectedEmployee.salaryRules;
        const existingRules = salaryRules.rules || [];
        const empId = selectedEmployee.employeeId.toString();

        // Find or create rule with ruleId = 9
        let ruleNine = existingRules.find(
          (rule) => rule.ruleId === 9 || rule.ruleId === "9"
        );

        if (!ruleNine) {
          // Create new rule with ruleId = 9 if it doesn't exist
          ruleNine = {
            id: Math.floor(10 + Math.random() * 90), // number
            empId: empId, // string
            ruleId: "9", // string
            ruleStatus: 1, // number
            param1: holidayOvertimePercent, // string containing holiday overtime percent value
            param2: holidayWorkingTimePercent, // string containing holiday working time percent value
            param3: "",
            param4: "",
            param5: "",
            param6: "",
          };
        } else {
          // Update ONLY the ruleNine object - preserve all other properties
          ruleNine.empId = empId; // string
          ruleNine.param1 = holidayOvertimePercent; // update with new holiday overtime percent value
          ruleNine.param2 = holidayWorkingTimePercent; // update with new holiday working time percent value
          // Keep all other properties as they are
        }

        // Generate final JSON using your helper
        const updatedJSON = finalJsonForUpdate(salaryRules, {
          empId: empId,
          rules: {
            filter: (r) => r.ruleId === 9 || r.ruleId === "9",
            newValue: ruleNine, // update ruleId=9 object
          },
        });
        const payload = { salaryRules: JSON.stringify(updatedJSON) };

        await updateEmployee({
          mac: selectedEmployee?.deviceMAC || "",
          id: selectedEmployee?.employeeId,
          payload,
        });
      });

      await Promise.all(updatePromises);
      toast.success("Holiday overtime settings updated successfully!");
    } catch (error) {
      console.error("Error saving holiday overtime settings:", error);
      toast.error("Failed to update holiday overtime settings.");
    }
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    // Allow only positive numbers (can be decimals for percentages)
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setter(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between">
        <label className="text-sm font-semibold">
          Holiday Overtime Percent
        </label>
        <input
          type="number"
          placeholder="Enter overtime percent"
          value={holidayOvertimePercent}
          onChange={handleInputChange(setHolidayOvertimePercent)}
          min="0"
          step="0.1"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
        />
      </div>

      <div className="flex gap-3.5 items-center justify-between">
        <label className="text-sm font-semibold">
          Holiday Working Time Percent
        </label>
        <input
          type="number"
          placeholder="Enter working time percent"
          value={holidayWorkingTimePercent}
          onChange={handleInputChange(setHolidayWorkingTimePercent)}
          min="0"
          step="0.1"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Holiday working time percent:</strong> daily total working
              hours without overtime, if we want, we can increase it on holiday.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Holiday overtime time percent:</strong> daily total
              overtime hours, if we want,we can increase it on holiday.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> if an employee works 2 days with per day
              salary of 500 and the multiplier is set to 2 holiday.working time
              pay = Holiday working days *500*2=2*500*2=2000
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> if an employee works 2 hours overtime in
              holiday with 100/hour and the multiplier is set to 3.Holiday
              overtime pay = overtime hour *100*3=2*100*3=600
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-gray-600">
              Enter percentage multipliers for holiday working hours and
              overtime (e.g., 1.5 for 150%, 2 for 200%)
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        disabled={
          updating || !holidayOvertimePercent || !holidayWorkingTimePercent
        }
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003556]"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
