import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useEmployees } from "@/hook/useEmployees";

export const LateArrivalPenalty2 = () => {
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  const { Employees } = useEmployees();

  // Save rule configuration
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
        const salaryRules = selectedEmployee.salaryRules;
        const existingRules = salaryRules.rules || [];
        const empId = selectedEmployee.employeeId.toString();

        // Find or create rule with ruleId = 17
        let ruleSeventeen = existingRules.find(
          (rule) => rule.ruleId === 17 || rule.ruleId === "17"
        );

        if (!ruleSeventeen) {
          // Create new rule with ruleId = 17 if it doesn't exist
          ruleSeventeen = {
            id: Math.floor(10 + Math.random() * 90), // number
            empId: empId, // string
            ruleId: "17", // string
            ruleStatus: 1, // number
            param1: null,
            param2: null,
            param3: null,
            param4: null,
            param5: null,
            param6: null,
          };
        } else {
          // Rule already exists, just ensure empId is correct
          ruleSeventeen.empId = empId; // string
          // Keep all other properties as they are
        }

        // Generate final JSON using your helper
        const updatedJSON = finalJsonForUpdate(salaryRules, {
          empId: empId,
          rules: {
            filter: (r) => r.ruleId === 17 || r.ruleId === "17",
            newValue: ruleSeventeen, // update ruleId=17 object
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

      toast.success("Late arrival penalty rule activated successfully!");
    } catch (error) {
      console.error("Error saving late arrival penalty rule:", error);
      toast.error("Failed to activate late arrival penalty rule.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Late &lt; Half Day = Deduct Half Day's Salary
            </h3>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800">
              Late &gt; Half Day = Deduct Full Day's Salary
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2 mb-1.5">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>If late before half day, deduct half day's salary.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>If late after half day, deduct full day's salary.</span>
          </li>
        </ul>

        <h4 className="text-sm font-semibold text-gray-900 mb-2">Example:</h4>
        <p className="text-sm text-gray-700">
          Suppose your company works from 08:00–12:00 in the morning and
          13:00–17:00 in the afternoon. If an employee is late between 08:00 and
          12:00, deduct half day's salary; if late after 12:00, deduct full
          day's salary. (Note: If absent without leave, treat as absenteeism.)
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={updating}
        className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? "Activating..." : "Activate Rule"}
      </button>
    </div>
  );
};
