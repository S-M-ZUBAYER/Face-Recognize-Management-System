import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { parseNormalData } from "@/lib/parseNormalData";
import {
  createGlobalSalaryRules,
  updateGlobalSalaryRules,
} from "../../../../utils/updateCreateGlobal";
import { useGlobalStore } from "@/zustand/useGlobalStore";

export const LateArrivalPenalty1 = () => {
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const selectedRule = useGlobalStore.getState().selectedRule();
  const { updateSelectedRule } = useGlobalStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load existing penalty amount value from selectedRule
  useEffect(() => {
    if (selectedRule?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedRule.salaryRules.rules === "string"
            ? JSON.parse(selectedRule.salaryRules.rules)
            : selectedRule.salaryRules.rules || [];

        const ruleFifteen = existingRules.find(
          (rule) => rule.ruleId === 15 || rule.ruleId === "15",
        );

        if (ruleFifteen && ruleFifteen.param1) {
          // param1 contains the penalty amount value
          const penaltyAmountValue =
            typeof ruleFifteen.param1 === "string"
              ? ruleFifteen.param1
              : String(ruleFifteen.param1);
          setPenaltyAmount(penaltyAmountValue);
        }
      } catch (error) {
        console.error("Error parsing penalty amount value:", error);
      }
    }
  }, [selectedRule]);

  // Save penalty amount configuration
  const handleSave = async () => {
    if (
      !penaltyAmount ||
      isNaN(penaltyAmount) ||
      parseFloat(penaltyAmount) < 0
    ) {
      toast.error("Please enter a valid positive number for penalty amount");
      return;
    }
    setIsSaving(true);

    try {
      const salaryRules = selectedRule.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = parseFloat(999);

      // Find or create rule with ruleId = 15
      let ruleFifteen = existingRules.find(
        (rule) => rule.ruleId === 15 || rule.ruleId === "15",
      );

      if (!ruleFifteen) {
        // Create new rule with ruleId = 15 if it doesn't exist
        ruleFifteen = {
          id: Math.floor(10 + Math.random() * 90), // number
          empId: empId, // string
          ruleId: "15", // string
          ruleStatus: 1, // number
          param1: penaltyAmount, // string containing penalty amount value
          param2: "",
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        // Update ONLY the ruleFifteen object - preserve all other properties
        ruleFifteen.empId = empId; // string
        ruleFifteen.param1 = penaltyAmount; // update with new penalty amount value
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
          filter: (r) => r.ruleId === 15 || r.ruleId === "15",
          newValue: ruleFifteen, // update ruleId=15 object
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

      toast.success("Late arrival penalty updated successfully!");
    } catch (error) {
      console.error("Error saving late arrival penalty:", error);
      toast.error("Failed to update late arrival penalty.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers (can be decimals for currency)
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setPenaltyAmount(value);
    }
  };
  const handleDelete = async () => {
    if (!selectedRule?.salaryRules?.rules) {
      toast.error("No late arrival penalty rule to delete.");
      return;
    }
    setIsDeleting(true);
    try {
      const salaryRules = selectedRule.salaryRules;
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        deleteRuleId: 15,
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
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Late Penalty
          </p>
          <input
            type="number"
            value={penaltyAmount}
            onChange={handleInputChange}
            placeholder="Penalty Per Occurrence"
            className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Deduct a fixed amount for each late occurrence</strong>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> If the penalty is set to 50 per
              occurrence and an employee is late 3 times, the penalty amount =
              50 × 3 = 150.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-gray-600">
              Enter the penalty amount to deduct for each late arrival
              occurrence
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
          disabled={isSaving || !penaltyAmount}
          className=" w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
