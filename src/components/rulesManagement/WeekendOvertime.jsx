import { useState } from "react";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

export const WeekendOvertime = () => {
  // const [weekendOvertimePercent, setWeekendOvertimePercent] = useState("");
  const [weekendWorkingTimePercent, setWeekendWorkingTimePercent] =
    useState("");
  const { employees } = useEmployeeStore();
  const Employees = employees();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Save weekend overtime configuration
  const handleSave = async () => {
    if (Employees.length === 0) {
      toast.error("Please select at least one employee!");
      return;
    }
    try {
      const updatePromises = Employees.map(async (selectedEmployee) => {
        if (!selectedEmployee?.employeeId) {
          toast.error("No employee selected");
          return;
        }

        // if (
        //   !weekendOvertimePercent ||
        //   isNaN(weekendOvertimePercent) ||
        //   parseFloat(weekendOvertimePercent) < 0
        // ) {
        //   toast.error(
        //     "Please enter a valid positive number for weekend overtime percent"
        //   );
        //   return;
        // }

        if (
          !weekendWorkingTimePercent ||
          isNaN(weekendWorkingTimePercent) ||
          parseFloat(weekendWorkingTimePercent) < 0
        ) {
          toast.error(
            "Please enter a valid positive number for weekend working time percent"
          );
          return;
        }
        const salaryRules = selectedEmployee.salaryRules;
        const existingRules = salaryRules.rules || [];
        const empId = selectedEmployee.employeeId.toString();

        // Find or create rule with ruleId = 8
        let ruleEight = existingRules.find(
          (rule) => rule.ruleId === 8 || rule.ruleId === "8"
        );

        if (!ruleEight) {
          // Create new rule with ruleId = 8 if it doesn't exist
          ruleEight = {
            id: Math.floor(10 + Math.random() * 90), // number
            empId: empId, // string
            ruleId: "8", // string
            ruleStatus: 1, // number
            // param1: weekendOvertimePercent, // string containing weekend overtime percent value
            param2: weekendWorkingTimePercent, // string containing weekend working time percent value
            param3: "",
            param4: "",
            param5: "",
            param6: "",
          };
        } else {
          // Update ONLY the ruleEight object - preserve all other properties
          ruleEight.empId = empId; // string
          // ruleEight.param1 = weekendOvertimePercent; // update with new weekend overtime percent value
          ruleEight.param2 = weekendWorkingTimePercent; // update with new weekend working time percent value
          // Keep all other properties as they are
        }

        // Generate final JSON using your helper
        const updatedJSON = finalJsonForUpdate(salaryRules, {
          empId: empId,
          rules: {
            filter: (r) => r.ruleId === 8 || r.ruleId === "8",
            newValue: ruleEight, // update ruleId=8 object
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
      toast.success("Weekend overtime settings updated successfully!");
    } catch (error) {
      console.error("Error saving weekend overtime settings:", error);
      toast.error("Failed to update weekend overtime settings.");
    }
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    // Allow only positive numbers (can be decimals for percentages)
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setter(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex gap-3.5 items-center justify-between mt-3.5">
        <label className="text-sm font-semibold">
          Weekend Overtime Percent
        </label>
        <input
          type="number"
          placeholder="Enter overtime percent"
          value={weekendOvertimePercent}
          onChange={handleInputChange(setWeekendOvertimePercent)}
          min="0"
          step="0.1"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
        />
      </div> */}

      <div className="flex gap-3.5 items-center justify-between mt-3.5">
        <label className="text-sm font-semibold">
          Weekend Working Time Percent
        </label>
        <input
          type="number"
          placeholder="Enter working time percent"
          value={weekendWorkingTimePercent}
          onChange={handleInputChange(setWeekendWorkingTimePercent)}
          min="0"
          step="0.1"
          className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Weekend Overtime Pay Details
        </h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              Weekend overtime pay is calculated by first determining the
              employee’s hourly overtime rate. This is done by dividing the
              employee’s daily salary rate by the standard number of working
              hours per day. The total weekend overtime pay is then calculated
              by multiplying the total number of weekend overtime hours by the
              hourly overtime rate and applying a predefined weekend shift
              multiplier. This ensures that employees receive additional
              compensation for working overtime on weekends at a higher rate
              than normal working days.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Weekend Overtime Calculation Logic</strong>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>
                Convert the daily salary into an hourly overtime rate:
              </strong>{" "}
              Overtime Rate = Daily Salary ÷ Daily Working Hours
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Calculate weekend overtime pay:</strong> Weekend Overtime
              Pay = Weekend Overtime Hours × Overtime Rate × Weekend Multiplier
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-gray-600">
              Add the calculated amount to the employee’s total weekend overtime
              payment.
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        disabled={updating || !weekendWorkingTimePercent}
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003556]"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
