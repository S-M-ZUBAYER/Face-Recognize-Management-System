import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { parseNormalData } from "@/lib/parseNormalData";
import {
  createGlobalSalaryRules,
  updateGlobalSalaryRules,
} from "../../../../utils/updateCreateGlobal";
import { useGlobalStore } from "@/zustand/useGlobalStore";

export const LateArrivalFine5 = () => {
  const [incrementalAmount, setIncrementalAmount] = useState("");
  const selectedRule = useGlobalStore.getState().selectedRule();
  const { updateSelectedRule } = useGlobalStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load existing incremental amount value from selectedRule
  useEffect(() => {
    if (selectedRule?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedRule.salaryRules.rules === "string"
            ? JSON.parse(selectedRule.salaryRules.rules)
            : selectedRule.salaryRules.rules || [];

        const ruleTwenty = existingRules.find(
          (rule) => rule.ruleId === 20 || rule.ruleId === "20",
        );

        if (ruleTwenty && ruleTwenty.param1) {
          // param1 contains the incremental amount value
          const incrementalAmountValue =
            typeof ruleTwenty.param1 === "string"
              ? ruleTwenty.param1
              : String(ruleTwenty.param1);
          setIncrementalAmount(incrementalAmountValue);
        }
      } catch (error) {
        console.error("Error parsing incremental amount value:", error);
      }
    }
  }, [selectedRule]);

  // Save incremental amount configuration
  const handleSave = async () => {
    // if (!selectedEmployee?.employeeId) {
    //   toast.error("No employee selected");
    //   return;
    // }

    if (
      !incrementalAmount ||
      isNaN(incrementalAmount) ||
      parseFloat(incrementalAmount) < 0
    ) {
      toast.error(
        "Please enter a valid positive number for incremental amount",
      );
      return;
    }
    setIsSaving(true);
    try {
      const salaryRules = selectedRule.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = parseFloat(999);

      // Find or create rule with ruleId = 20
      let ruleTwenty = existingRules.find(
        (rule) => rule.ruleId === 20 || rule.ruleId === "20",
      );

      if (!ruleTwenty) {
        // Create new rule with ruleId = 20 if it doesn't exist
        ruleTwenty = {
          id: Math.floor(10 + Math.random() * 90), // number
          empId: empId, // string
          ruleId: "20", // string
          ruleStatus: 1, // number
          param1: incrementalAmount, // string containing incremental amount value
          param2: "",
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        // Update ONLY the ruleTwenty object - preserve all other properties
        ruleTwenty.empId = empId; // string
        ruleTwenty.param1 = incrementalAmount; // update with new incremental amount value
        // Keep all other properties as they are
      }

      // Generate final JSON using your helper
      const isEmptyObject = (obj) =>
        obj && typeof obj === "object" && Object.keys(obj).length === 0;

      const hasExistingRule = selectedRule && !isEmptyObject(selectedRule);

      const baseSalaryRules = hasExistingRule ? salaryRules : { rules: [] };
      // Generate final JSON using your helper
      const updatedJSON = finalJsonForUpdate(baseSalaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 20 || r.ruleId === "20",
          newValue: ruleTwenty, // update ruleId=20 object
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

      toast.success("Incremental late penalty updated successfully!");
    } catch (error) {
      console.error("Error saving incremental late penalty:", error);
      toast.error("Failed to update incremental late penalty.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers (can be decimals for currency)
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setIncrementalAmount(value);
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
        deleteRuleId: 20,
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
      <div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Incremental Late Penalty
          </h3>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">Incremental Value</p>
            <input
              type="number"
              value={incrementalAmount}
              onChange={handleInputChange}
              placeholder="Increment per late"
              className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <p className="text-sm text-gray-700 mb-3">
          The rule is that if you are late more than once, your fine will
          increase continuously.
        </p>

        <h4 className="text-sm font-semibold text-gray-900 mb-2">Example :</h4>
        <p className="text-sm text-gray-700">
          If the incremental amount is set at 50, then the first time he is
          late, his fine will be 50. But if he is late 4 times in that month,
          then his fine will increase continuously. First day = 50, second day =
          100, third day = 150, fourth day = 200 Then his total fine is 50 + 100
          + 150 + 200 = 500
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Enter the base amount that increases with each late occurrence
        </p>
      </div>

      <hr className="border-gray-200" />

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
          disabled={isSaving || !incrementalAmount}
          className=" w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
