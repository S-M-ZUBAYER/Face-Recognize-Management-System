import { useState } from "react";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

export const LateArrivalFine5 = () => {
  const [incrementalAmount, setIncrementalAmount] = useState("");
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  const { employees } = useEmployeeStore();
  const Employees = employees();

  // Save incremental amount configuration
  const handleSave = async () => {
    if (Employees.length === 0) {
      toast.error("Please select at least one employee!");
      return;
    }

    if (
      !incrementalAmount ||
      isNaN(incrementalAmount) ||
      parseFloat(incrementalAmount) < 0
    ) {
      toast.error(
        "Please enter a valid positive number for incremental amount"
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

        // Find or create rule with ruleId = 20
        let ruleTwenty = existingRules.find(
          (rule) => rule.ruleId === 20 || rule.ruleId === "20"
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
        const updatedJSON = finalJsonForUpdate(salaryRules, {
          empId: empId,
          rules: {
            filter: (r) => r.ruleId === 20 || r.ruleId === "20",
            newValue: ruleTwenty, // update ruleId=20 object
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

      toast.success("Incremental late penalty updated successfully!");
    } catch (error) {
      console.error("Error saving incremental late penalty:", error);
      toast.error("Failed to update incremental late penalty.");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers (can be decimals for currency)
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setIncrementalAmount(value);
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

      <button
        onClick={handleSave}
        disabled={updating || !incrementalAmount}
        className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
