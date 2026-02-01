import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { parseNormalData } from "@/lib/parseNormalData";
import {
  createGlobalSalaryRules,
  updateGlobalSalaryRules,
} from "../../../../utils/updateCreateGlobal";
import { useGlobalStore } from "@/zustand/useGlobalStore";

export const AbsenceForm = () => {
  const [penaltyDays, setPenaltyDays] = useState("");
  const selectedRule = useGlobalStore.getState().selectedRule();
  const { updateSelectedRule } = useGlobalStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load existing penalty days value from selectedRule
  useEffect(() => {
    if (selectedRule?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedRule.salaryRules.rules === "string"
            ? JSON.parse(selectedRule.salaryRules.rules)
            : selectedRule.salaryRules.rules || [];

        const ruleThirteen = existingRules.find(
          (rule) => rule.ruleId === 13 || rule.ruleId === "13",
        );

        if (ruleThirteen && ruleThirteen.param2) {
          // param2 contains the penalty days value
          const penaltyDaysValue =
            typeof ruleThirteen.param2 === "string"
              ? ruleThirteen.param2
              : String(ruleThirteen.param2);
          setPenaltyDays(penaltyDaysValue);
        }
      } catch (error) {
        console.error("Error parsing penalty days value:", error);
      }
    }
  }, [selectedRule]);

  // Save penalty days configuration
  const handleSave = async () => {
    // if (!selectedEmployee?.employeeId) {
    //   toast.error("No employee selected");
    //   return;
    // }

    if (!penaltyDays || isNaN(penaltyDays) || parseInt(penaltyDays) <= 0) {
      toast.error("Please enter a valid positive number for penalty days");
      return;
    }

    setIsSaving(true);

    try {
      const salaryRules = selectedRule.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = parseFloat(999);

      // Find or create rule with ruleId = 13
      let ruleThirteen = existingRules.find(
        (rule) => rule.ruleId === 13 || rule.ruleId === "13",
      );

      if (!ruleThirteen) {
        // Create new rule with ruleId = 13 if it doesn't exist
        ruleThirteen = {
          id: Math.floor(10 + Math.random() * 90), // number
          empId: empId, // string
          ruleId: "13", // string
          ruleStatus: 1, // number
          param1: "",
          param2: penaltyDays, // string containing penalty days value
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        // Update ONLY the ruleThirteen object - preserve all other properties
        ruleThirteen.empId = empId; // string
        ruleThirteen.param2 = penaltyDays; // update with new penalty days value
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
          filter: (r) => r.ruleId === 13 || r.ruleId === "13",
          newValue: ruleThirteen, // update ruleId=13 object
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

      toast.success("Penalty days updated successfully!");
    } catch (error) {
      console.error("Error saving penalty days:", error);
      toast.error("Failed to update penalty days.");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers greater than 0
    if (value === "" || (!isNaN(value) && parseInt(value) > 0)) {
      setPenaltyDays(value);
    }
  };

  const handleDelete = async () => {
    if (!selectedRule?.salaryRules?.rules) {
      toast.error("No existing absence rule to delete.");
      return;
    }

    setIsDeleting(true);
    try {
      const salaryRules = selectedRule.salaryRules;
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        deleteRuleId: 13,
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
          <p className="text-sm font-semibold text-gray-800 mb-2">Leave Day</p>
          <input
            type="number"
            placeholder="Enter Penalty Days"
            value={penaltyDays}
            onChange={handleInputChange}
            min="1"
            className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Deduct how many day's salary for each absence.</strong>
            </span>
          </li>

          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              if the penalty days are set to 3, one day's absence will result in
              a deduction of 3 day's salary.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-gray-600">
              Enter the number of salary days to deduct for each day of absence
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
          disabled={isSaving}
          className=" w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
export default AbsenceForm;
