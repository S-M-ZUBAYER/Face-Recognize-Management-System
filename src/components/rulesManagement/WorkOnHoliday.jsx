import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useUserStore } from "@/zustand/useUserStore";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { parseNormalData } from "@/lib/parseNormalData";
import useUpdateProgressStore from "@/zustand/updateProgressStore";

export const WorkOnHoliday = () => {
  const [specialDates, setSpecialDates] = useState([]);
  const { employees, updateEmployee: storeEmployeeUpdate } = useEmployeeStore();
  const Employees = employees();
  const { setGlobalRulesIds } = useUserStore();

  const updateProgressStore = useUpdateProgressStore();

  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Handle calendar date selection - fix timezone issue
  const handleCalendarSelect = (dates) => {
    if (dates) {
      // Fix timezone issue by creating dates with correct timezone
      const fixedDates = dates.map((date) => {
        // Create date without timezone offset issues
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        return new Date(year, month, day);
      });
      setSpecialDates(fixedDates);
    } else {
      setSpecialDates([]);
    }
  };

  // Format date for storage (YYYY-MM-DD format)
  const formatDateForStorage = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}T00:00:00.000`;
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  // Save work on holiday configuration
  const handleSave = async () => {
    try {
      // Check if any employees are selected
      if (Employees.length === 0) {
        toast.error("Please select at least one employee!");
        return;
      }

      updateProgressStore.startUpdate(Employees, "Work on Holiday");

      for (const selectedEmployee of Employees) {
        if (!selectedEmployee?.employeeId) {
          toast.error("No employee selected");
          return;
        }

        const employeeName =
          selectedEmployee.name || selectedEmployee.employeeId;

        // Mark as processing
        updateProgressStore.updateProgress(employeeName, "processing");

        try {
          const salaryRules = selectedEmployee.salaryRules;
          const existingRules = salaryRules.rules || [];
          const empId = selectedEmployee.employeeId.toString();

          const existGeneralDays =
            selectedEmployee.salaryRules.generalDays || [];

          // Format dates for storage
          const generalDaysArray = specialDates.map((date) =>
            formatDateForStorage(date),
          );

          // Find or create rule with ruleId = 3
          let ruleFour = existingRules.find(
            (rule) => rule.ruleId === 3 || rule.ruleId === "3",
          );

          if (!ruleFour) {
            // Create new rule with ruleId = 3 if it doesn't exist
            ruleFour = {
              id: Math.floor(10 + Math.random() * 90), // number
              empId: empId, // string
              ruleId: "3", // string
              ruleStatus: 1, // number
              param1: null,
              param2: null,
              param3: null,
              param4: null,
              param5: null,
              param6: null,
            };
          } else {
            // Update ONLY the ruleFour object - preserve all other properties
            ruleFour.empId = empId; // string
            // Keep all other properties as they are
          }

          // Generate final JSON using your helper
          const updatedJSON = finalJsonForUpdate(salaryRules, {
            empId: empId,
            rules: {
              filter: (r) => r.ruleId === 3 || r.ruleId === "3",
              newValue: ruleFour, // update ruleId=3 object
            },
            generalDays: [...generalDaysArray, ...existGeneralDays], // update generalDays with selected dates
          });

          const payload = { salaryRules: JSON.stringify(updatedJSON) };

          await updateEmployee({
            mac: selectedEmployee?.deviceMAC || "",
            id: selectedEmployee?.employeeId,
            payload,
          });
          storeEmployeeUpdate(
            selectedEmployee.employeeId,
            selectedEmployee.deviceMAC || "",
            { salaryRules: parseNormalData(updatedJSON) },
          );
          updateProgressStore.updateProgress(employeeName, "success");

          await delay(500);
        } catch (error) {
          console.error(`Error updating employee ${employeeName}:`, error);
          // Mark as failed with error message
          updateProgressStore.updateProgress(
            employeeName,
            "failed",
            error.message || "Update failed",
          );
        }
      }

      setGlobalRulesIds(3);

      // toast.success("Work on holiday days updated successfully!");
    } catch (error) {
      console.error("Error saving work on holiday days:", error);
      toast.error("Failed to update work on holiday days.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mt-4 mx-[8vw]">
        <Calendar
          mode="multiple"
          selected={specialDates}
          onSelect={handleCalendarSelect}
          className="w-[21vw]"
          modifiersStyles={{
            today: {
              backgroundColor: "transparent",
              color: "inherit",
            },
          }}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              Suppose an employee works on Friday,which is a public holiday.Now
              they do not come on Saturday,even though Saturday is a regular
              working day.if Saturday is not selected here as the replacement
              day,the system will reduce one day's salary. To avoid this you
              need to mark it here or in Rule 13, where you can choose which day
              the employee will take as the replacement.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              For example,if an employee works on Friday,October 18,2025 (a
              public holyday),and takes off on Saturday,October 19,2025 (a
              regular working day),then the system will reduce one day's salary
              unless Saturday is marked as the replacement day. To prevent this
              deduction,mark the replacement day here or in rule 13
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
