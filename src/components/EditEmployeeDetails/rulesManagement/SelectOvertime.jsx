import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useEditEmployeeStore } from "@/zustand/useEditEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";

export const SelectOvertime = () => {
  const [allowOvertime, setAllowOvertime] = useState("No");
  const [multiplier, setMultiplier] = useState("1");
  const { selectedEmployee } = useEditEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Load existing overtime values from selectedEmployee
  useEffect(() => {
    if (selectedEmployee?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedEmployee.salaryRules.rules === "string"
            ? JSON.parse(selectedEmployee.salaryRules.rules)
            : selectedEmployee.salaryRules.rules || [];

        const ruleTwentyThree = existingRules.find(
          (rule) => rule.ruleId === 23 || rule.ruleId === "23"
        );

        if (ruleTwentyThree) {
          // param1 contains allow overtime value (true/false as string)
          if (ruleTwentyThree.param1) {
            const allowOvertimeValue =
              typeof ruleTwentyThree.param1 === "string"
                ? ruleTwentyThree.param1
                : String(ruleTwentyThree.param1);
            setAllowOvertime(allowOvertimeValue === "true" ? "Yes" : "No");
          }

          // param2 contains multiplier value
          if (ruleTwentyThree.param2) {
            const multiplierValue =
              typeof ruleTwentyThree.param2 === "string"
                ? ruleTwentyThree.param2
                : String(ruleTwentyThree.param2);
            setMultiplier(multiplierValue);
          }
        }
      } catch (error) {
        console.error("Error parsing overtime values:", error);
      }
    }
  }, [selectedEmployee]);

  // Save overtime configuration
  const handleSave = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    if (
      allowOvertime === "Yes" &&
      (!multiplier || isNaN(multiplier) || parseFloat(multiplier) <= 0)
    ) {
      toast.error(
        "Please enter a valid positive number for overtime multiplier"
      );
      return;
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = selectedEmployee.employeeId.toString();

      // Convert "Yes"/"No" to "true"/"false" strings for storage
      const allowOvertimeValue = allowOvertime === "Yes" ? "true" : "false";

      // Find or create rule with ruleId = 23
      let ruleTwentyThree = existingRules.find(
        (rule) => rule.ruleId === 23 || rule.ruleId === "23"
      );

      if (!ruleTwentyThree) {
        // Create new rule with ruleId = 23 if it doesn't exist
        ruleTwentyThree = {
          id: Math.floor(10 + Math.random() * 90), // number
          empId: empId, // string
          ruleId: "23", // string
          ruleStatus: 1, // number
          param1: allowOvertimeValue, // string containing "true" or "false"
          param2: allowOvertime === "Yes" ? multiplier : "", // string containing multiplier value
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        // Update ONLY the ruleTwentyThree object - preserve all other properties
        ruleTwentyThree.empId = empId; // string
        ruleTwentyThree.param1 = allowOvertimeValue; // update with new allow overtime value
        ruleTwentyThree.param2 = allowOvertime === "Yes" ? multiplier : ""; // update with new multiplier value
        // Keep all other properties as they are
      }

      // Generate final JSON using your helper
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 23 || r.ruleId === "23",
          newValue: ruleTwentyThree, // update ruleId=23 object
        },
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      console.log("Overtime settings updated successfully:", {
        allowOvertime: allowOvertimeValue,
        multiplier: allowOvertime === "Yes" ? multiplier : "",
      });
      toast.success("Overtime settings updated successfully!");
    } catch (error) {
      console.error("Error saving overtime settings:", error);
      toast.error("Failed to update overtime settings.");
    }
  };

  const handleMultiplierChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers greater than 0
    if (value === "" || (!isNaN(value) && parseFloat(value) > 0)) {
      setMultiplier(value);
    }
  };
  const handleDelete = async () => {
    try {
      const salaryRules = selectedEmployee.salaryRules;
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        deleteRuleId: 23,
      });
      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });
      toast.success("Shift rules deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting shift rules:", error);
      toast.error("Failed to delete shift rules.");
    }
  };

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
                onChange={handleMultiplierChange}
                placeholder="1.5"
                min="0.1"
                className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
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
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span className="text-gray-600">
              Choose whether to allow overtime and set the multiplier rate
            </span>
          </li>
        </ul>
      </div>

      <hr className="border-gray-200" />

      <div className=" flex items-center w-full justify-between mt-4 gap-4">
        {/* Delete */}

        <button
          onClick={handleDelete}
          disabled={updating}
          className="w-[50%]  bg-red-500 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Deleting..." : "Delete"}
        </button>
        {/* Save */}
        <button
          onClick={handleSave}
          disabled={updating}
          className=" w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
