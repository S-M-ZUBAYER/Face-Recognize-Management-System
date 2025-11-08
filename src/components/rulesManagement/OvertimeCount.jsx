import { useState } from "react";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useEmployees } from "@/hook/useEmployees";

export const OvertImeCount = () => {
  const [minOvertimeUnit, setMinOvertimeUnit] = useState("");
  const { updateEmployee, updating } = useSingleEmployeeDetails();
  const { Employees } = useEmployees();

  // Save minimum overtime unit configuration
  const handleSave = async () => {
    if (Employees.length === 0) {
      toast.error("Please select at least one employee!");
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
      const updatePromises = Employees.map(async (selectedEmployee) => {
        const salaryRules = selectedEmployee.salaryRules;
        const existingRules = salaryRules.rules || [];
        const empId = selectedEmployee.employeeId.toString();

        // Find or create rule with ruleId = 7
        let ruleSeven = existingRules.find(
          (rule) => rule.ruleId === 7 || rule.ruleId === "7"
        );

        if (!ruleSeven) {
          ruleSeven = {
            id: Math.floor(10 + Math.random() * 90), // number
            empId: empId, // string
            ruleId: "7", // string
            ruleStatus: 1, // number
            param1: minOvertimeUnit,
            param2: "",
            param3: "",
            param4: "",
            param5: "",
            param6: "",
          };
        } else {
          ruleSeven.empId = empId;
          ruleSeven.param1 = minOvertimeUnit;
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
      });
      await Promise.all(updatePromises);

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

      <button
        onClick={handleSave}
        disabled={updating || !minOvertimeUnit}
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003556]"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
