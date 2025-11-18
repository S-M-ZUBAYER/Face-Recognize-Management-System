import { useState, useEffect } from "react";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";

export const OvertImeCount = () => {
  const [minOvertimeUnit, setMinOvertimeUnit] = useState("");
  const { selectedEmployee } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Load existing minimum overtime unit value from selectedEmployee
  useEffect(() => {
    if (selectedEmployee?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedEmployee.salaryRules.rules === "string"
            ? JSON.parse(selectedEmployee.salaryRules.rules)
            : selectedEmployee.salaryRules.rules || [];

        const ruleSeven = existingRules.find(
          (rule) => rule.ruleId === 7 || rule.ruleId === "7"
        );

        if (ruleSeven && ruleSeven.param1) {
          // param1 contains the minimum overtime unit value
          const minUnitValue =
            typeof ruleSeven.param1 === "string"
              ? ruleSeven.param1
              : String(ruleSeven.param1);
          setMinOvertimeUnit(minUnitValue);
        }
      } catch (error) {
        console.error("Error parsing minimum overtime unit value:", error);
      }
    }
  }, [selectedEmployee]);

  // Save minimum overtime unit configuration
  const handleSave = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    if (
      !minOvertimeUnit ||
      isNaN(minOvertimeUnit) ||
      parseInt(minOvertimeUnit) <= 0
    ) {
      toast.error(
        "Please enter a valid positive number for minimum overtime unit"
      );
      return;
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = selectedEmployee.employeeId.toString();

      // Find or create rule with ruleId = 7
      let ruleSeven = existingRules.find(
        (rule) => rule.ruleId === 7 || rule.ruleId === "7"
      );

      if (!ruleSeven) {
        // Create new rule with ruleId = 7 if it doesn't exist
        ruleSeven = {
          id: Math.floor(10 + Math.random() * 90), // number
          empId: empId, // string
          ruleId: "7", // string
          ruleStatus: 1, // number
          param1: minOvertimeUnit, // string containing minimum overtime unit value (minutes)
          param2: "",
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        // Update ONLY the ruleSeven object - preserve all other properties
        ruleSeven.empId = empId; // string
        ruleSeven.param1 = minOvertimeUnit; // update with new minimum overtime unit value
        // Keep all other properties as they are
      }

      // Generate final JSON using your helper
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 7 || r.ruleId === "7",
          newValue: ruleSeven, // update ruleId=7 object
        },
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      console.log(
        "Minimum overtime unit updated successfully:",
        minOvertimeUnit
      );
      toast.success("Minimum overtime unit updated successfully!");
    } catch (error) {
      console.error("Error saving minimum overtime unit:", error);
      toast.error("Failed to update minimum overtime unit.");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers greater than 0
    if (value === "" || (!isNaN(value) && parseInt(value) > 0)) {
      setMinOvertimeUnit(value);
    }
  };
  const handleDelete = async () => {
    try {
      const salaryRules = selectedEmployee.salaryRules;
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        deleteRuleId: 7,
      });
      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });
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
          Minimum OverTime Unit (Minutes)
        </label>
        <input
          type="number"
          placeholder="Minimum OverTime Unit (Minutes)"
          value={minOvertimeUnit}
          onChange={handleInputChange}
          min="1"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Minimum overTime unit</strong>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Example:</strong>{" "}
              {`Set to 30 minutes. if the employee's overtime is 20 minutes, the calculated overtime is 0.if the work is >=30 minutes and <60 minutes, the overtime will be 30 minutes.Similarly calculated.`}
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-gray-600">
              Set the minimum number of minutes required to count as overtime
            </span>
          </li>
        </ul>
      </div>

      <div className=" flex items-center w-full justify-between mt-4 gap-4">
        {/* Delete */}

        <button
          onClick={handleDelete}
          disabled={updating}
          className="w-[50%]  bg-red-500 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Deleting..." : "Delete"}
        </button>
        {/* Save */}
        <button
          onClick={handleSave}
          disabled={updating || !minOvertimeUnit}
          className=" w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
