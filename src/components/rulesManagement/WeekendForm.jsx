import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useUserStore } from "@/zustand/useUserStore";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

export const WeekendForm = () => {
  const [selectedDays, setSelectedDays] = useState([]);
  const { employees } = useEmployeeStore();
  const Employees = employees();
  const { setGlobalRulesIds } = useUserStore();

  const { updateEmployee, updating } = useSingleEmployeeDetails();

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleDayChange = (day, checked) => {
    if (checked) {
      // Check if already reached maximum of 5 days
      if (selectedDays.length >= 5) {
        toast.error("Maximum 5 weekend days allowed");
        return;
      }
      setSelectedDays((prev) => [...prev, day]);
    } else {
      setSelectedDays((prev) => prev.filter((d) => d !== day));
    }
  };

  // Save weekend configuration
  const handleSave = async () => {
    try {
      // Check if any employees are selected
      if (Employees.length === 0) {
        toast.error("Please select at least one employee!");
        return;
      }
      const updatePromises = Employees.map(async (selectedEmployee) => {
        if (!selectedEmployee?.employeeId) {
          toast.error("No employee selected");
          return;
        }
        const salaryRules = selectedEmployee.salaryRules;
        const existingRules = salaryRules.rules || [];
        const empId = selectedEmployee.employeeId.toString();

        // Parse existing rules - preserve ALL existing rules

        // Find or create rule with ruleId = 2
        let ruleThree = existingRules.find(
          (rule) => rule.ruleId === 2 || rule.ruleId === "2"
        );

        if (!ruleThree) {
          // Create new rule with ruleId = 2 if it doesn't exist
          ruleThree = {
            id: Math.floor(10 + Math.random() * 90), // number
            empId: empId, // string
            ruleId: "2", // string
            ruleStatus: 1, // number
            param1: selectedDays.join(","), // string of comma-separated days
            param2: "",
            param3: "",
            param4: "",
            param5: "",
            param6: "",
          };
        } else {
          // Update ONLY the ruleThree object - preserve all other properties
          (ruleThree.empId = empId), // string
            (ruleThree.param1 = selectedDays.join(","));
          // Keep all other properties as they are
        }

        // Generate final JSON using your helper
        const updatedJSON = finalJsonForUpdate(salaryRules, {
          empId: empId,
          rules: {
            filter: (r) => r.ruleId === 2,
            newValue: ruleThree, // update ruleId=0 object
          },
        });

        const payload = { salaryRules: JSON.stringify(updatedJSON) };
        return updateEmployee({
          mac: selectedEmployee?.deviceMAC || "",
          id: selectedEmployee?.employeeId,
          payload,
        });
      });

      await Promise.all(updatePromises);
      setGlobalRulesIds(2);
      toast.success("Weekend days updated successfully!");
    } catch (error) {
      console.error("Error saving weekend days:", error);
      toast.error("Failed to update weekend days.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold ">Weekend Days</label>
        {/* Show selected days count */}
        <div className="my-2 text-xs text-gray-500">
          {selectedDays.length}/5 days selected
        </div>
        <div className="space-y-3">
          {daysOfWeek.map((day) => (
            <label key={day} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedDays.includes(day)}
                onCheckedChange={(checked) => handleDayChange(day, checked)}
                disabled={
                  !selectedDays.includes(day) && selectedDays.length >= 5
                }
                className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
              />
              <span
                className={`text-sm ${
                  !selectedDays.includes(day) && selectedDays.length >= 5
                    ? "text-gray-400"
                    : ""
                }`}
              >
                {day}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Optional: Show selected days for debugging */}
      <div className="text-sm text-gray-600">
        Selected days: {selectedDays.join(", ") || "None"}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              Select weekends,click the day to choose it as a weekend.When it
              shows as checked,it means the day is selected,and there will be no
              attendance required on that weekend. The selection will be
              automatically saved.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-red-500">
              Maximum 5 weekend days allowed. You can select up to 5 days.
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        disabled={updating}
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
