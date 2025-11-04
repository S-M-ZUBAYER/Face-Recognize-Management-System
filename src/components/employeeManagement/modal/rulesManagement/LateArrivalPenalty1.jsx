import { useState, useEffect } from "react";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";

export const LateArrivalPenalty1 = () => {
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const { selectedEmployee } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Load existing penalty amount value from selectedEmployee
  useEffect(() => {
    if (selectedEmployee?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedEmployee.salaryRules.rules === "string"
            ? JSON.parse(selectedEmployee.salaryRules.rules)
            : selectedEmployee.salaryRules.rules || [];

        const ruleFifteen = existingRules.find(
          (rule) => rule.ruleId === 15 || rule.ruleId === "15"
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
  }, [selectedEmployee]);

  // Save penalty amount configuration
  const handleSave = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    if (
      !penaltyAmount ||
      isNaN(penaltyAmount) ||
      parseFloat(penaltyAmount) < 0
    ) {
      toast.error("Please enter a valid positive number for penalty amount");
      return;
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = selectedEmployee.employeeId.toString();

      // Find or create rule with ruleId = 15
      let ruleFifteen = existingRules.find(
        (rule) => rule.ruleId === 15 || rule.ruleId === "15"
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

      // Generate final JSON using your helper
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 15 || r.ruleId === "15",
          newValue: ruleFifteen, // update ruleId=15 object
        },
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      toast.success("Late arrival penalty updated successfully!");
    } catch (error) {
      console.error("Error saving late arrival penalty:", error);
      toast.error("Failed to update late arrival penalty.");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers (can be decimals for currency)
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setPenaltyAmount(value);
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

      <button
        onClick={handleSave}
        disabled={updating || !penaltyAmount}
        className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
