import { useState, useEffect } from "react";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";

export const WeekendOvertime = () => {
  const [weekendOvertimePercent, setWeekendOvertimePercent] = useState("");
  const [weekendWorkingTimePercent, setWeekendWorkingTimePercent] =
    useState("");
  const { selectedEmployee } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Load existing weekend overtime values from selectedEmployee
  useEffect(() => {
    if (selectedEmployee?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedEmployee.salaryRules.rules === "string"
            ? JSON.parse(selectedEmployee.salaryRules.rules)
            : selectedEmployee.salaryRules.rules || [];

        const ruleEight = existingRules.find(
          (rule) => rule.ruleId === 8 || rule.ruleId === "8"
        );

        if (ruleEight) {
          // param1 contains weekend overtime percent value
          if (ruleEight.param1) {
            const overtimePercentValue =
              typeof ruleEight.param1 === "string"
                ? ruleEight.param1
                : String(ruleEight.param1);
            setWeekendOvertimePercent(overtimePercentValue);
          }

          // param2 contains weekend working time percent value
          if (ruleEight.param2) {
            const workingTimePercentValue =
              typeof ruleEight.param2 === "string"
                ? ruleEight.param2
                : String(ruleEight.param2);
            setWeekendWorkingTimePercent(workingTimePercentValue);
          }
        }
      } catch (error) {
        console.error("Error parsing weekend overtime values:", error);
      }
    }
  }, [selectedEmployee]);

  // Save weekend overtime configuration
  const handleSave = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    if (
      !weekendOvertimePercent ||
      isNaN(weekendOvertimePercent) ||
      parseFloat(weekendOvertimePercent) < 0
    ) {
      toast.error(
        "Please enter a valid positive number for weekend overtime percent"
      );
      return;
    }

    if (
      !weekendWorkingTimePercent ||
      isNaN(weekendWorkingTimePercent) ||
      parseFloat(weekendWorkingTimePercent) < 0
    ) {
      toast.error(
        "Please enter a valid positive number for weekend working time percent"
      );
      return;
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = selectedEmployee.employeeId.toString();

      // Find or create rule with ruleId = 8
      let ruleEight = existingRules.find(
        (rule) => rule.ruleId === 8 || rule.ruleId === "8"
      );

      if (!ruleEight) {
        // Create new rule with ruleId = 8 if it doesn't exist
        ruleEight = {
          id: Math.floor(10 + Math.random() * 90), // number
          empId: empId, // string
          ruleId: "8", // string
          ruleStatus: 1, // number
          param1: weekendOvertimePercent, // string containing weekend overtime percent value
          param2: weekendWorkingTimePercent, // string containing weekend working time percent value
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        // Update ONLY the ruleEight object - preserve all other properties
        ruleEight.empId = empId; // string
        ruleEight.param1 = weekendOvertimePercent; // update with new weekend overtime percent value
        ruleEight.param2 = weekendWorkingTimePercent; // update with new weekend working time percent value
        // Keep all other properties as they are
      }

      // Generate final JSON using your helper
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 8 || r.ruleId === "8",
          newValue: ruleEight, // update ruleId=8 object
        },
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      console.log("Weekend overtime settings updated successfully:", {
        weekendOvertimePercent,
        weekendWorkingTimePercent,
      });
      toast.success("Weekend overtime settings updated successfully!");
    } catch (error) {
      console.error("Error saving weekend overtime settings:", error);
      toast.error("Failed to update weekend overtime settings.");
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
          Weekend Overtime Percent
        </label>
        <input
          type="number"
          placeholder="Enter overtime percent"
          value={weekendOvertimePercent}
          onChange={handleInputChange(setWeekendOvertimePercent)}
          min="0"
          step="0.1"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
        />
      </div>

      <div className="flex gap-3.5 items-center justify-between">
        <label className="text-sm font-semibold">
          Weekend Working Time Percent
        </label>
        <input
          type="number"
          placeholder="Enter working time percent"
          value={weekendWorkingTimePercent}
          onChange={handleInputChange(setWeekendWorkingTimePercent)}
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
              <strong>Weekend working time percent:</strong> daily total working
              hours without overtime, if we want, we can increase it on weekend.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Weekend overtime time percent:</strong> daily total
              overtime hours, if we want,we can increase it on weekend.
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
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-gray-600">
              Enter percentage multipliers for weekend working hours and
              overtime (e.g., 1.5 for 150%, 2 for 200%)
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        disabled={
          updating || !weekendOvertimePercent || !weekendWorkingTimePercent
        }
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003556]"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
