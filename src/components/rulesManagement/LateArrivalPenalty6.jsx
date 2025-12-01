import { useState } from "react";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

export const LateArrivalPenalty6 = () => {
  const [dayShiftPenalty, setDayShiftPenalty] = useState("");
  const [nightShiftPenalty, setNightShiftPenalty] = useState("");
  const { updateEmployee, updating } = useSingleEmployeeDetails();
  const { employees } = useEmployeeStore();
  const Employees = employees();

  // Save shift penalty configuration
  const handleSave = async () => {
    if (Employees.length === 0) {
      toast.error("Please select at least one employee!");
      return;
    }
    if (
      !dayShiftPenalty ||
      isNaN(dayShiftPenalty) ||
      parseFloat(dayShiftPenalty) < 0
    ) {
      toast.error("Please enter a valid positive number for day shift penalty");
      return;
    }

    if (
      !nightShiftPenalty ||
      isNaN(nightShiftPenalty) ||
      parseFloat(nightShiftPenalty) < 0
    ) {
      toast.error(
        "Please enter a valid positive number for night shift penalty"
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

        // Find or create rule with ruleId = 21
        let ruleTwentyOne = existingRules.find(
          (rule) => rule.ruleId === 21 || rule.ruleId === "21"
        );

        if (!ruleTwentyOne) {
          // Create new rule with ruleId = 21 if it doesn't exist
          ruleTwentyOne = {
            id: Math.floor(10 + Math.random() * 90), // number
            empId: empId, // string
            ruleId: "21", // string
            ruleStatus: 1, // number
            param1: dayShiftPenalty, // string containing day shift penalty value
            param2: nightShiftPenalty, // string containing night shift penalty value
            param3: "",
            param4: "",
            param5: "",
            param6: "",
          };
        } else {
          // Update ONLY the ruleTwentyOne object - preserve all other properties
          ruleTwentyOne.empId = empId; // string
          ruleTwentyOne.param1 = dayShiftPenalty; // update with new day shift penalty value
          ruleTwentyOne.param2 = nightShiftPenalty; // update with new night shift penalty value
          // Keep all other properties as they are
        }

        // Generate final JSON using your helper
        const updatedJSON = finalJsonForUpdate(salaryRules, {
          empId: empId,
          rules: {
            filter: (r) => r.ruleId === 21 || r.ruleId === "21",
            newValue: ruleTwentyOne, // update ruleId=21 object
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
      toast.success("Shift penalty settings updated successfully!");
    } catch (error) {
      console.error("Error saving shift penalty settings:", error);
      toast.error("Failed to update shift penalty settings.");
    }
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    // Allow only positive numbers (can be decimals for currency)
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setter(value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-2.5">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Day Shift Penalty</p>
              <input
                type="number"
                value={dayShiftPenalty}
                onChange={handleInputChange(setDayShiftPenalty)}
                placeholder="Enter Amount (/Occurrence)"
                className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Night Shift Penalty</p>
              <input
                type="number"
                value={nightShiftPenalty}
                onChange={handleInputChange(setNightShiftPenalty)}
                placeholder="Enter Amount (/Occurrence)"
                className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Set different lateness penalties based on shifts.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Example :</strong> Set day shift lateness penalty to 30
              and night shift lateness penalty to 20.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              If an employee is late 3 times during the day shift, the penalty
              will be 3 × 30 = 90.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              If an employee is late 2 times during the night shift, the penalty
              will be 2 × 20 = 40.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span className="text-gray-600">
              Enter penalty amounts for day and night shift lateness occurrences
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        disabled={updating || !dayShiftPenalty || !nightShiftPenalty}
        className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
