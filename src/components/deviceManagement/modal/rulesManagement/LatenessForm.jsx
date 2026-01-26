import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { parseNormalData } from "@/lib/parseNormalData";
import {
  createGlobalSalaryRules,
  updateGlobalSalaryRules,
} from "../../../../utils/updateCreateGlobal";
import { useGlobalStore } from "@/zustand/useGlobalStore";

export const LatenessForm = () => {
  const [lateTime, setLateTime] = useState("");
  const selectedRule = useGlobalStore.getState().selectedRule();
  const { updateSelectedRule } = useGlobalStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load existing lateness value from selectedRule
  useEffect(() => {
    if (selectedRule?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedRule.salaryRules.rules === "string"
            ? JSON.parse(selectedRule.salaryRules.rules)
            : selectedRule.salaryRules.rules || [];

        const ruleFour = existingRules.find(
          (rule) => rule.ruleId === 4 || rule.ruleId === "4",
        );

        if (ruleFour && ruleFour.param1) {
          // param1 should contain the late time value as string
          const lateTimeValue =
            typeof ruleFour.param1 === "string"
              ? ruleFour.param1
              : String(ruleFour.param1);
          setLateTime(lateTimeValue);
        }
      } catch (error) {
        console.error("Error parsing lateness value:", error);
      }
    }
  }, [selectedRule]);

  // Save lateness configuration
  const handleSave = async () => {
    // if (!selectedEmployee?.employeeId) {
    //   toast.error("No employee selected");
    //   return;
    // }

    if (!lateTime || isNaN(lateTime) || parseInt(lateTime) < 0) {
      toast.error("Please enter a valid positive number for late time");
      return;
    }

    setIsSaving(true);

    try {
      const salaryRules = selectedRule.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = parseFloat(999);

      // Find or create rule with ruleId = 4
      let ruleFive = existingRules.find(
        (rule) => rule.ruleId === 4 || rule.ruleId === "4",
      );

      if (!ruleFive) {
        // Create new rule with ruleId = 4 if it doesn't exist
        ruleFive = {
          id: Math.floor(10 + Math.random() * 90), // number
          empId: empId, // string
          ruleId: "4", // string
          ruleStatus: 1, // number
          param1: lateTime, // string containing the late time value
          param2: "",
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        // Update ONLY the ruleFive object - preserve all other properties
        ruleFive.empId = empId; // string
        ruleFive.param1 = lateTime; // update with new late time value
        // Keep all other properties as they are
      }

      // Generate final JSON using your helper
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 4 || r.ruleId === "4",
          newValue: ruleFive, // update ruleId=4 object
        },
      });

      if (selectedRule) {
        await updateGlobalSalaryRules({
          salaryRules: JSON.stringify(updatedJSON),
        });
      } else {
        await createGlobalSalaryRules({
          salaryRules: JSON.stringify(updatedJSON),
        });
      }
      // Update Zustand store
      updateSelectedRule({ salaryRules: parseNormalData(updatedJSON) });
      toast.success("Lateness setting updated successfully!");
    } catch (error) {
      console.error("Error saving lateness setting:", error);
      toast.error("Failed to update lateness setting.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers
    if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
      setLateTime(value);
    }
  };
  const handleDelete = async () => {
    if (!selectedRule?.salaryRules) {
      toast.error("No salary rules to delete from.");
      return;
    }
    setIsDeleting(true);
    try {
      const salaryRules = selectedRule.salaryRules;
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        deleteRuleId: 4,
      });

      await updateGlobalSalaryRules({
        salaryRules: JSON.stringify(updatedJSON),
      });

      updateSelectedRule({ salaryRules: parseNormalData(updatedJSON) });
      toast.success("Shift rules deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting shift rules:", error);
      toast.error("Failed to delete shift rules.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between pt-2.5">
        <label className="text-sm font-semibold">
          Late time setting (minutes)
        </label>
        <input
          type="number"
          placeholder="Enter last time of late count"
          value={lateTime}
          onChange={handleInputChange}
          min="0"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Lateness Warning System</strong>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> if set to 5, and the start time is
              08:00, lateness starts from 08:05, providing a 5-minute grace
              period as a benefit to employees
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-gray-600">
              Enter the number of minutes allowed before counting as late
            </span>
          </li>
        </ul>
      </div>

      <div className=" flex items-center w-full justify-between mt-4 gap-4">
        {/* Delete */}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-[50%]  bg-red-500 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving || !lateTime}
          className=" w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
