import { useState } from "react";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useUserStore } from "@/zustand/useUserStore";
import { parseNormalData } from "@/lib/parseNormalData";
import useUpdateProgressStore from "@/zustand/updateProgressStore";

export const AbsenceForm = () => {
  const [penaltyDays, setPenaltyDays] = useState("");
  const { updateEmployee, updating } = useSingleEmployeeDetails();
  const { setGlobalRulesIds } = useUserStore();

  const updateProgressStore = useUpdateProgressStore();

  const { employees, updateEmployee: storeEmployeeUpdate } = useEmployeeStore();
  const Employees = employees();

  // Save penalty days configuration
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const handleSave = async () => {
    try {
      if (Employees.length === 0) {
        toast.error("Please select at least one employee!");
        return;
      }

      if (!penaltyDays || isNaN(penaltyDays) || parseInt(penaltyDays) <= 0) {
        toast.error("Please enter a valid positive number for penalty days");
        return;
      }

      updateProgressStore.startUpdate(Employees, "Absence Penalty");

      for (const selectedEmployee of Employees) {
        const employeeName =
          selectedEmployee.name || selectedEmployee.employeeId;

        try {
          if (!selectedEmployee?.employeeId) {
            toast.error(`Skipping invalid employee`);
            continue; // ✅ FIXED (don't break loop)
          }

          updateProgressStore.updateProgress(employeeName, "processing");

          const salaryRules = selectedEmployee.salaryRules || {}; // ✅ safe fallback
          const existingRules = Array.isArray(salaryRules.rules)
            ? salaryRules.rules
            : [];

          const empId = selectedEmployee.employeeId.toString();

          let ruleThirteen = existingRules.find(
            (rule) => rule.ruleId === 13 || rule.ruleId === "13",
          );

          if (!ruleThirteen) {
            ruleThirteen = {
              id: Math.floor(10 + Math.random() * 90),
              empId,
              ruleId: "13",
              ruleStatus: 1,
              param1: "",
              param2: penaltyDays,
              param3: "",
              param4: "",
              param5: "",
              param6: "",
            };
          } else {
            ruleThirteen.empId = empId;
            ruleThirteen.param2 = penaltyDays;
          }

          const updatedJSON = finalJsonForUpdate(salaryRules, {
            empId,
            rules: {
              filter: (r) => r.ruleId === 13 || r.ruleId === "13",
              newValue: ruleThirteen,
            },
          });

          const payload = {
            salaryRules: JSON.stringify(updatedJSON),
          };

          // ✅ IMPORTANT: await API call
          await updateEmployee({
            mac: selectedEmployee.deviceMAC || "",
            id: selectedEmployee.employeeId,
            payload,
          });

          storeEmployeeUpdate(
            selectedEmployee.employeeId,
            selectedEmployee.deviceMAC || "",
            { salaryRules: parseNormalData(updatedJSON) },
          );

          updateProgressStore.updateProgress(employeeName, "success");

          // ✅ small delay (prevents network overload)
          await delay(500);
        } catch (error) {
          console.error(`Error updating ${employeeName}:`, error);

          updateProgressStore.updateProgress(
            employeeName,
            "failed",
            error.message || "Update failed",
          );
        }
      }

      setGlobalRulesIds(13);
      toast.success("Penalty days updated successfully!");
    } catch (error) {
      console.error("Error saving penalty days:", error);
      toast.error("Failed to update penalty days.");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers greater than 0
    if (value === "" || (!isNaN(value) && parseInt(value) > 0)) {
      setPenaltyDays(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-800 mb-2">Leave Day</p>
          <input
            type="number"
            placeholder="Enter Penalty Days"
            value={penaltyDays}
            onChange={handleInputChange}
            min="1"
            className="w-[50%] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Deduct how many day's salary for each absence.</strong>
            </span>
          </li>

          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              if the penalty days are set to 3, one day's absence will result in
              a deduction of 3 day's salary.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span className="text-gray-600">
              Enter the number of salary days to deduct for each day of absence
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        disabled={updating || !penaltyDays}
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003556]"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
export default AbsenceForm;
