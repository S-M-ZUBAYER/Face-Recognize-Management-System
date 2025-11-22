import { useState, useEffect } from "react";
import { useEditEmployeeStore } from "@/zustand/useEditEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";

export const LateArrivalFine4 = () => {
  const [latenessTime, setLatenessTime] = useState("");
  const [fixedPenalty, setFixedPenalty] = useState("");
  const { selectedEmployee } = useEditEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Load existing lateness time and fixed penalty values from selectedEmployee
  useEffect(() => {
    if (selectedEmployee?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedEmployee.salaryRules.rules === "string"
            ? JSON.parse(selectedEmployee.salaryRules.rules)
            : selectedEmployee.salaryRules.rules || [];

        const ruleNineteen = existingRules.find(
          (rule) => rule.ruleId === 19 || rule.ruleId === "19"
        );

        if (ruleNineteen) {
          // param1 contains lateness time value
          if (ruleNineteen.param1) {
            const latenessTimeValue =
              typeof ruleNineteen.param1 === "string"
                ? ruleNineteen.param1
                : String(ruleNineteen.param1);
            setLatenessTime(latenessTimeValue);
          }

          // param2 contains fixed penalty value
          if (ruleNineteen.param2) {
            const fixedPenaltyValue =
              typeof ruleNineteen.param2 === "string"
                ? ruleNineteen.param2
                : String(ruleNineteen.param2);
            setFixedPenalty(fixedPenaltyValue);
          }
        }
      } catch (error) {
        console.error(
          "Error parsing lateness time and fixed penalty values:",
          error
        );
      }
    }
  }, [selectedEmployee]);

  // Save lateness time and fixed penalty configuration
  const handleSave = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    if (!latenessTime || isNaN(latenessTime) || parseInt(latenessTime) < 0) {
      toast.error("Please enter a valid positive number for lateness time");
      return;
    }

    if (!fixedPenalty || isNaN(fixedPenalty) || parseFloat(fixedPenalty) < 0) {
      toast.error("Please enter a valid positive number for fixed penalty");
      return;
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = selectedEmployee.employeeId.toString();

      // Find or create rule with ruleId = 19
      let ruleNineteen = existingRules.find(
        (rule) => rule.ruleId === 19 || rule.ruleId === "19"
      );

      if (!ruleNineteen) {
        // Create new rule with ruleId = 19 if it doesn't exist
        ruleNineteen = {
          id: Math.floor(10 + Math.random() * 90), // number
          empId: empId, // string
          ruleId: "19", // string
          ruleStatus: 1, // number
          param1: latenessTime, // string containing lateness time value (minutes)
          param2: fixedPenalty, // string containing fixed penalty value
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        // Update ONLY the ruleNineteen object - preserve all other properties
        ruleNineteen.empId = empId; // string
        ruleNineteen.param1 = latenessTime; // update with new lateness time value
        ruleNineteen.param2 = fixedPenalty; // update with new fixed penalty value
        // Keep all other properties as they are
      }

      // Generate final JSON using your helper
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 19 || r.ruleId === "19",
          newValue: ruleNineteen, // update ruleId=19 object
        },
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      toast.success("Late arrival fine settings updated successfully!");
    } catch (error) {
      console.error("Error saving late arrival fine settings:", error);
      toast.error("Failed to update late arrival fine settings.");
    }
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    // Allow only positive numbers
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setter(value);
    }
  };
  const handleDelete = async () => {
    try {
      const salaryRules = selectedEmployee.salaryRules;
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        deleteRuleId: 19,
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
      <div>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-gray-600">Lateness Time (Minutes)</p>
            <input
              type="number"
              value={latenessTime}
              onChange={handleInputChange(setLatenessTime)}
              placeholder="Enter Time (Minutes)"
              min="0"
              className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
            />
          </div>

          <div className="p-4 border border-gray-200 rounded-lg flex justify-between items-center ">
            <p className="text-sm text-gray-600">Fixed Penalty</p>
            <input
              type="number"
              value={fixedPenalty}
              onChange={handleInputChange(setFixedPenalty)}
              placeholder="Fixed Penalty"
              className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
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
              Implement a fixed penalty amount for employees who exceed this
              lateness time in a month (one attendance cycle).
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Example:</strong> Set time to 30 minutes and fixed penalty
              to 150. If an employee exceeds 30 minutes of total lateness in a
              month (one attendance cycle), deduct a fixed penalty of 150.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>No penalty for lateness within this time.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span className="text-gray-600">
              Set the threshold time (minutes) and fixed penalty amount
            </span>
          </li>
        </ul>
      </div>

      <hr className="border-gray-200" />

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
          disabled={updating || !latenessTime || !fixedPenalty}
          className=" w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
