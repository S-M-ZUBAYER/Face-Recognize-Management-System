import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { parseNormalData } from "@/lib/parseNormalData";
import {
  createGlobalSalaryRules,
  updateGlobalSalaryRules,
} from "../../../../utils/updateCreateGlobal";
import { useGlobalStore } from "@/zustand/useGlobalStore";

export const FlexibleWork = () => {
  const [lateMinutes, setLateMinutes] = useState("");
  const [leaveLateMinutes, setLeaveLateMinutes] = useState("");
  const selectedRule = useGlobalStore.getState().selectedRule();
  const { updateSelectedRule } = useGlobalStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load existing flexible work values from selectedRule
  useEffect(() => {
    if (selectedRule?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedRule.salaryRules.rules === "string"
            ? JSON.parse(selectedRule.salaryRules.rules)
            : selectedRule.salaryRules.rules || [];

        const ruleFive = existingRules.find(
          (rule) => rule.ruleId === 5 || rule.ruleId === "5",
        );

        if (ruleFive) {
          // param1 contains late minutes value
          if (ruleFive.param1) {
            const lateValue =
              typeof ruleFive.param1 === "string"
                ? ruleFive.param1
                : String(ruleFive.param1);
            setLateMinutes(lateValue);
          }

          // param2 contains leave late minutes value
          if (ruleFive.param2) {
            const leaveLateValue =
              typeof ruleFive.param2 === "string"
                ? ruleFive.param2
                : String(ruleFive.param2);
            setLeaveLateMinutes(leaveLateValue);
          }
        }
      } catch (error) {
        console.error("Error parsing flexible work values:", error);
      }
    }
  }, [selectedRule]);

  // Save flexible work configuration
  const handleSave = async () => {
    // if (!selectedEmployee?.employeeId) {
    //   toast.error("No employee selected");
    //   return;
    // }

    if (!lateMinutes || isNaN(lateMinutes) || parseInt(lateMinutes) < 0) {
      toast.error("Please enter a valid positive number for late minutes");
      return;
    }

    if (
      !leaveLateMinutes ||
      isNaN(leaveLateMinutes) ||
      parseInt(leaveLateMinutes) < 0
    ) {
      toast.error(
        "Please enter a valid positive number for leave late minutes",
      );
      return;
    }

    setIsSaving(true);

    try {
      const salaryRules = selectedRule.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = parseFloat(999);

      // Find or create rule with ruleId = 5
      let ruleFive = existingRules.find(
        (rule) => rule.ruleId === 5 || rule.ruleId === "5",
      );

      if (!ruleFive) {
        // Create new rule with ruleId = 5 if it doesn't exist
        ruleFive = {
          id: Math.floor(10 + Math.random() * 90), // number
          empId: empId, // string
          ruleId: "5", // string
          ruleStatus: 1, // number
          param1: lateMinutes, // string containing late minutes value
          param2: leaveLateMinutes, // string containing leave late minutes value
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        // Update ONLY the ruleFive object - preserve all other properties
        ruleFive.empId = empId; // string
        ruleFive.param1 = lateMinutes; // update with new late minutes value
        ruleFive.param2 = leaveLateMinutes; // update with new leave late minutes value
        // Keep all other properties as they are
      }

      const isEmptyObject = (obj) =>
        obj && typeof obj === "object" && Object.keys(obj).length === 0;

      const hasExistingRule = selectedRule && !isEmptyObject(selectedRule);

      const baseSalaryRules = hasExistingRule ? salaryRules : { rules: [] };
      // Generate final JSON using your helper
      const updatedJSON = finalJsonForUpdate(baseSalaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 5 || r.ruleId === "5",
          newValue: ruleFive, // update ruleId=5 object
        },
      });

      const payload = {
        salaryRules: JSON.stringify(updatedJSON),
      };

      if (hasExistingRule) {
        await updateGlobalSalaryRules(payload);
      } else {
        await createGlobalSalaryRules(payload);
      }
      // Update Zustand store
      updateSelectedRule({ salaryRules: parseNormalData(updatedJSON) });
      toast.success("Flexible work settings updated successfully!");
    } catch (error) {
      console.error("Error saving flexible work settings:", error);
      toast.error("Failed to update flexible work settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    // Allow only positive numbers
    if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
      setter(value);
    }
  };
  const handleDelete = async () => {
    if (!selectedRule?.salaryRules?.rules) {
      toast.error("No flexible work settings to delete.");
      return;
    }

    setIsDeleting(true);

    try {
      const salaryRules = selectedRule.salaryRules;
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        deleteRuleId: 5,
      });

      await updateGlobalSalaryRules({
        salaryRules: JSON.stringify(updatedJSON),
      });

      // Update Zustand store
      updateSelectedRule({ salaryRules: parseNormalData(updatedJSON) });
      toast.success("Shift rules deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting shift rules:", error);
      toast.error("Failed to delete shift rules.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between pt-2.5">
        <label className="text-sm font-semibold">Late Arrival (Minutes)</label>
        <input
          type="number"
          placeholder="Enter Time (Minutes)"
          value={lateMinutes}
          onChange={handleInputChange(setLateMinutes)}
          min="0"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
        />
      </div>

      <div className="flex gap-3.5 items-center justify-between">
        <label className="text-sm font-semibold">Leave Late (Minutes)</label>
        <input
          type="number"
          placeholder="Enter Time (Minutes)"
          value={leaveLateMinutes}
          onChange={handleInputChange(setLeaveLateMinutes)}
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
              <strong>Flexible Working Hours Settings</strong>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> if you set late arrival by 1 minute and
              late leave by 2 minutes, for example, if the work start time is
              08:00 and the end time is 17:00, arriving at 08:01 means leaving
              at 17:02. Similarly, arriving at 08:10 means leaving at
              17:20,based on company policy this can also be set 1:1.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-gray-600">
              Set the number of minutes allowed for flexible arrival and
              corresponding late departure
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
          disabled={isSaving || !lateMinutes || !leaveLateMinutes}
          className=" w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
