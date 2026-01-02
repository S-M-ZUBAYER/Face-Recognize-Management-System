import { useState } from "react";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import useSelectedEmployeeStore from "@/zustand/useSelectedEmployeeStore";
import { parseNormalData } from "@/lib/parseNormalData";
import { useUserStore } from "@/zustand/useUserStore";

export const MissedPunch = () => {
  const [costPerMissedPunch, setCostPerMissedPunch] = useState("");
  const [missAcceptableTime, setMissAcceptableTime] = useState("");
  const { setRulesIds } = useUserStore();

  const { updateEmployee, updating } = useSingleEmployeeDetails();
  const { selectedEmployees, updateEmployeeSalaryRules } =
    useSelectedEmployeeStore();

  // Save missed punch configuration
  const handleSave = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee!");
      return;
    }
    if (
      !costPerMissedPunch ||
      isNaN(costPerMissedPunch) ||
      parseFloat(costPerMissedPunch) < 0
    ) {
      toast.error(
        "Please enter a valid positive number for cost per missed punch"
      );
      return;
    }

    if (
      !missAcceptableTime ||
      isNaN(missAcceptableTime) ||
      parseInt(missAcceptableTime) < 0
    ) {
      toast.error(
        "Please enter a valid positive number for miss acceptable time"
      );
      return;
    }

    try {
      const updatePromises = selectedEmployees.map(async (selectedEmployee) => {
        const salaryRules = selectedEmployee.salaryRules;
        const existingRules = salaryRules.rules || [];
        const empId = selectedEmployee.employeeId.toString();

        // Find or create rule with ruleId = 22
        let ruleTwentyTwo = existingRules.find(
          (rule) => rule.ruleId === 22 || rule.ruleId === "22"
        );

        if (!ruleTwentyTwo) {
          // Create new rule with ruleId = 22 if it doesn't exist
          ruleTwentyTwo = {
            id: Date.now(), // number
            empId: empId, // string
            ruleId: "22", // string
            ruleStatus: 1, // number
            param1: costPerMissedPunch, // string containing cost per missed punch value
            param2: missAcceptableTime, // string containing miss acceptable time value
            param3: "",
            param4: "",
            param5: "",
            param6: "",
          };
        } else {
          // Update ONLY the ruleTwentyTwo object - preserve all other properties
          ruleTwentyTwo.empId = empId; // string
          ruleTwentyTwo.param1 = costPerMissedPunch; // update with new cost per missed punch value
          ruleTwentyTwo.param2 = missAcceptableTime; // update with new miss acceptable time value
          // Keep all other properties as they are
        }

        // Generate final JSON using your helper
        const updatedJSON = finalJsonForUpdate(salaryRules, {
          empId: empId,
          rules: {
            filter: (r) => r.ruleId === 22 || r.ruleId === "22",
            newValue: ruleTwentyTwo, // update ruleId=22 object
          },
        });
        updateEmployeeSalaryRules(empId, parseNormalData(updatedJSON));
        const payload = { salaryRules: JSON.stringify(updatedJSON) };

        await updateEmployee({
          mac: selectedEmployee?.deviceMAC || "",
          id: selectedEmployee?.employeeId,
          payload,
        });
      });
      await Promise.all(updatePromises);
      setRulesIds(22);
      toast.success("Missed punch settings updated successfully!");
    } catch (error) {
      console.error("Error saving missed punch settings:", error);
      toast.error("Failed to update missed punch settings.");
    }
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    // Allow only positive numbers
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setter(value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 text-center">
              Cost Per Missed Punch
            </h3>
            <input
              type="number"
              value={costPerMissedPunch}
              onChange={handleInputChange(setCostPerMissedPunch)}
              placeholder="Enter cost"
              className="w-50 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
            />
          </div>

          <div className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">
              Miss acceptable time
            </h3>
            <input
              type="number"
              value={missAcceptableTime}
              onChange={handleInputChange(setMissAcceptableTime)}
              placeholder="Enter times"
              min="0"
              className="w-50 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              If you miss punching more than the set times, a penalty will be
              deducted.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              If the missed punch cost is set to 30 and the acceptable times are
              set to 3, and an employee misses punching 4 times in a month (one
              attendance cycle), the deduction will be (4-3) × 30 = 30; no
              deduction for 3 or fewer times.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span className="text-gray-600">
              Set the cost per missed punch and the number of acceptable missed
              punches
            </span>
          </li>
        </ul>
      </div>

      <hr className="border-gray-200" />

      <button
        onClick={handleSave}
        disabled={updating || !costPerMissedPunch || !missAcceptableTime}
        className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
