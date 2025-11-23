import { useState } from "react";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

export const LateArrivalPenalty3 = () => {
  const [hourlyRate, setHourlyRate] = useState("");

  const { employees } = useEmployeeStore();
  const Employees = employees();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Save hourly rate configuration
  const handleSave = async () => {
    if (Employees.length === 0) {
      toast.error("Please select at least one employee!");
      return;
    }
    if (!hourlyRate || isNaN(hourlyRate) || parseFloat(hourlyRate) < 0) {
      toast.error("Please enter a valid positive number for hourly rate");
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

        // Find or create rule with ruleId = 18
        let ruleEighteen = existingRules.find(
          (rule) => rule.ruleId === 18 || rule.ruleId === "18"
        );

        if (!ruleEighteen) {
          // Create new rule with ruleId = 18 if it doesn't exist
          ruleEighteen = {
            id: Math.floor(10 + Math.random() * 90), // number
            empId: empId, // string
            ruleId: "18", // string
            ruleStatus: 1, // number
            param1: "1",
            param2: hourlyRate, // string containing hourly rate value
            param3: "",
            param4: "",
            param5: "",
            param6: "",
          };
        } else {
          // Update ONLY the ruleEighteen object - preserve all other properties
          ruleEighteen.empId = empId; // string
          ruleEighteen.param2 = hourlyRate; // update with new hourly rate value
          // Keep all other properties as they are
        }

        // Generate final JSON using your helper
        const updatedJSON = finalJsonForUpdate(salaryRules, {
          empId: empId,
          rules: {
            filter: (r) => r.ruleId === 18 || r.ruleId === "18",
            newValue: ruleEighteen, // update ruleId=18 object
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
      toast.success("Hourly late penalty rate updated successfully!");
    } catch (error) {
      console.error("Error saving hourly late penalty rate:", error);
      toast.error("Failed to update hourly late penalty rate.");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers (can be decimals for currency)
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setHourlyRate(value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Total Lateness Time</p>
                <input
                  type="number"
                  value={1}
                  disabled
                  placeholder="Enter Amount (/Hour)"
                  className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm  cursor-not-allowed"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600"> Hourly Late Penalty</p>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={handleInputChange}
                  placeholder="Enter Amount (/Hour)"
                  className="w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Set the penalty amount per hour of lateness.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              <strong>Example:</strong> If the hourly rate is set to 60, and an
              employee is late for 30 minutes in a month (one attendance cycle),
              the deduction will be 30; similarly calculated for total lateness
              time.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span className="text-gray-600">
              Total lateness time is automatically calculated by the system
            </span>
          </li>
        </ul>
      </div>

      <hr className="border-gray-200" />

      <button
        onClick={handleSave}
        disabled={updating || !hourlyRate}
        className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
