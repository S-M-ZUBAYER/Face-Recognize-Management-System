import { useState } from "react";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import useSelectedEmployeeStore from "@/zustand/useSelectedEmployeeStore";
import { parseNormalData } from "@/lib/parseNormalData";

export const UseOverTimeLateness = () => {
  const [lateTime, setLateTime] = useState("");
  const [costOverTime, setCostOverTime] = useState("");
  const { updateEmployee, updating } = useSingleEmployeeDetails();
  const { selectedEmployees, updateEmployeeSalaryRules } =
    useSelectedEmployeeStore();

  // Save overtime lateness configuration
  const handleSave = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee!");
      return;
    }
    if (!lateTime || isNaN(lateTime) || parseInt(lateTime) < 0) {
      toast.error("Please enter a valid positive number for late time");
      return;
    }

    if (!costOverTime || isNaN(costOverTime) || parseInt(costOverTime) < 0) {
      toast.error("Please enter a valid positive number for cost over time");
      return;
    }

    try {
      const updatePromises = selectedEmployees.map(async (selectedEmployee) => {
        const salaryRules = selectedEmployee.salaryRules;
        const existingRules = salaryRules.rules || [];
        const empId = selectedEmployee.employeeId.toString();

        // Find or create rule with ruleId = 6
        let ruleSix = existingRules.find(
          (rule) => rule.ruleId === 6 || rule.ruleId === "6"
        );

        if (!ruleSix) {
          // Create new rule with ruleId = 6 if it doesn't exist
          ruleSix = {
            id: Math.floor(10 + Math.random() * 90), // number
            empId: empId, // string
            ruleId: "6", // string
            ruleStatus: 1, // number
            param1: lateTime, // string containing late time value (minutes)
            param2: costOverTime, // string containing cost over time value (minutes)
            param3: "",
            param4: "",
            param5: "",
            param6: "",
          };
        } else {
          // Update ONLY the ruleSix object - preserve all other properties
          ruleSix.empId = empId; // string
          ruleSix.param1 = lateTime; // update with new late time value
          ruleSix.param2 = costOverTime; // update with new cost over time value
          // Keep all other properties as they are
        }

        // Generate final JSON using your helper
        const updatedJSON = finalJsonForUpdate(salaryRules, {
          empId: empId,
          rules: {
            filter: (r) => r.ruleId === 6 || r.ruleId === "6",
            newValue: ruleSix, // update ruleId=6 object
          },
        });

        updateEmployeeSalaryRules(empId, parseNormalData(updateEmployee));

        const payload = { salaryRules: JSON.stringify(updatedJSON) };

        await updateEmployee({
          mac: selectedEmployee?.deviceMAC || "",
          id: selectedEmployee?.employeeId,
          payload,
        });
      });

      await Promise.all(updatePromises);

      toast.success("Overtime lateness settings updated successfully!");
    } catch (error) {
      console.error("Error saving overtime lateness settings:", error);
      toast.error("Failed to update overtime lateness settings.");
    }
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    // Allow only positive numbers
    if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
      setter(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3.5 items-center justify-between pt-2.5">
        <label className="text-sm font-semibold">Late Time (Minutes)</label>
        <input
          type="number"
          placeholder="Enter Time (Minutes)"
          value={lateTime}
          onChange={handleInputChange(setLateTime)}
          min="0"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
        />
      </div>

      <div className="flex gap-3.5 items-center justify-between">
        <label className="text-sm font-semibold">
          Cost Over Time (Minutes)
        </label>
        <input
          type="number"
          placeholder="Enter Cost Over Time Minutes"
          value={costOverTime}
          onChange={handleInputChange(setCostOverTime)}
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
              <strong>Replace lateness time with overtime</strong>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong> The rule is to replace lateness first
              with holiday overtime,if not available then with weekend
              overtime.For example,if lateness is set to 1 minute and overtime
              replacement is also 1 minute,and the start time is 08:00,arriving
              at 08:10 means 10 minutes of lateness, and if there are 120
              minutes of holiday overtime,it will be reduced to 110 minutes.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-gray-600">
              Set the conversion rate between lateness minutes and overtime
              minutes
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        disabled={updating || !lateTime || !costOverTime}
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003556]"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
