import { useState, useEffect, useCallback } from "react";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";

export const SetTotalLeaveDays = () => {
  const [totalDays, setTotalDays] = useState("");
  const [leaveDays, setLeaveDays] = useState({
    "Maternity Leave": "",
    "Marriage Leave": "",
    "Paternity Leave": "",
    "Sick Leave": "",
    "Casual Leave": "",
    "Earned leave": "",
    "Without Pay Leave": "",
    "Rest Leave": "",
    Others: "",
  });

  const { selectedEmployee } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Load existing leave values from selectedEmployee
  useEffect(() => {
    if (selectedEmployee?.salaryRules?.rules) {
      try {
        const existingRules =
          typeof selectedEmployee.salaryRules.rules === "string"
            ? JSON.parse(selectedEmployee.salaryRules.rules)
            : selectedEmployee.salaryRules.rules || [];

        const ruleTwentyFour = existingRules.find(
          (rule) => rule.ruleId === 24 || rule.ruleId === "24"
        );

        if (ruleTwentyFour) {
          // param1 contains total days value
          if (ruleTwentyFour.param1) {
            const totalDaysValue =
              typeof ruleTwentyFour.param1 === "string"
                ? ruleTwentyFour.param1
                : String(ruleTwentyFour.param1);
            setTotalDays(totalDaysValue);
          }

          // param2 contains leave days object
          if (ruleTwentyFour.param2) {
            const leaveDaysObj =
              typeof ruleTwentyFour.param2 === "string"
                ? JSON.parse(ruleTwentyFour.param2)
                : ruleTwentyFour.param2;

            if (typeof leaveDaysObj === "object" && leaveDaysObj !== null) {
              setLeaveDays({
                "Maternity Leave": String(
                  leaveDaysObj["Maternity Leave"] || ""
                ),
                "Marriage Leave": String(leaveDaysObj["Marriage Leave"] || ""),
                "Paternity Leave": String(
                  leaveDaysObj["Paternity Leave"] || ""
                ),
                "Sick Leave": String(leaveDaysObj["Sick Leave"] || ""),
                "Casual Leave": String(leaveDaysObj["Casual Leave"] || ""),
                "Earned leave": String(leaveDaysObj["Earned leave"] || ""),
                "Without Pay Leave": String(
                  leaveDaysObj["Without Pay Leave"] || ""
                ),
                "Rest Leave": String(leaveDaysObj["Rest Leave"] || ""),
                Others: String(leaveDaysObj["Others"] || ""),
              });
            }
          }
        }
      } catch (error) {
        console.error("Error parsing leave values:", error);
      }
    }
  }, [selectedEmployee]);

  // Calculate total from leave categories
  const calculateTotalFromLeaves = useCallback(() => {
    return Object.values(leaveDays).reduce((sum, days) => {
      return sum + (parseInt(days) || 0);
    }, 0);
  }, [leaveDays]);

  // Update total days automatically when leave categories change
  useEffect(() => {
    const calculatedTotal = calculateTotalFromLeaves();
    setTotalDays(calculatedTotal > 0 ? String(calculatedTotal) : "");
  }, [leaveDays, calculateTotalFromLeaves]);

  const handleLeaveDayChange = (leaveType, value) => {
    // Allow only positive numbers
    if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
      setLeaveDays((prev) => ({
        ...prev,
        [leaveType]: value,
      }));
    }
  };

  const handleTotalDaysChange = (value) => {
    // Allow only positive numbers
    if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
      setTotalDays(value);

      // If user manually sets total days, distribute evenly or keep existing ratios
      if (value !== "") {
        const currentTotal = calculateTotalFromLeaves();
        const newTotal = parseInt(value);

        if (currentTotal > 0 && newTotal > 0) {
          // Distribute based on current ratios
          const ratio = newTotal / currentTotal;
          const updatedLeaves = { ...leaveDays };

          Object.keys(updatedLeaves).forEach((key) => {
            const currentValue = parseInt(updatedLeaves[key]) || 0;
            if (currentValue > 0) {
              updatedLeaves[key] = String(Math.round(currentValue * ratio));
            }
          });

          // Adjust for rounding differences
          const distributedTotal = Object.values(updatedLeaves).reduce(
            (sum, days) => sum + (parseInt(days) || 0),
            0
          );
          if (distributedTotal !== newTotal) {
            // Find the largest category to adjust the difference
            let maxKey = Object.keys(updatedLeaves)[0];
            Object.keys(updatedLeaves).forEach((key) => {
              if (
                (parseInt(updatedLeaves[key]) || 0) >
                (parseInt(updatedLeaves[maxKey]) || 0)
              ) {
                maxKey = key;
              }
            });
            const adjustment = newTotal - distributedTotal;
            updatedLeaves[maxKey] = String(
              (parseInt(updatedLeaves[maxKey]) || 0) + adjustment
            );
          }

          setLeaveDays(updatedLeaves);
        } else {
          // If no current distribution, set all to 0
          setLeaveDays({
            "Maternity Leave": "0",
            "Marriage Leave": "0",
            "Paternity Leave": "0",
            "Sick Leave": "0",
            "Casual Leave": "0",
            "Earned leave": "0",
            "Without Pay Leave": "0",
            "Rest Leave": "0",
            Others: "0",
          });
        }
      }
    }
  };

  // Save leave configuration
  const handleSave = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    const finalTotalDays = parseInt(totalDays) || 0;

    if (finalTotalDays <= 0) {
      toast.error("Please set leave days for at least one category");
      return;
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = selectedEmployee.employeeId.toString();

      // Prepare leave days object with numbers
      const leaveDaysObj = {};
      Object.keys(leaveDays).forEach((key) => {
        leaveDaysObj[key] = parseInt(leaveDays[key]) || 0;
      });

      // Find or create rule with ruleId = 24
      let ruleTwentyFour = existingRules.find(
        (rule) => rule.ruleId === 24 || rule.ruleId === "24"
      );

      if (!ruleTwentyFour) {
        // Create new rule with ruleId = 24 if it doesn't exist
        ruleTwentyFour = {
          id: Math.floor(10 + Math.random() * 90), // number
          empId: empId, // string
          ruleId: "24", // string
          ruleStatus: 1, // number
          param1: String(finalTotalDays), // string containing total days value
          param2: JSON.stringify(leaveDaysObj), // string containing leave days object
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        // Update ONLY the ruleTwentyFour object - preserve all other properties
        ruleTwentyFour.empId = empId; // string
        ruleTwentyFour.param1 = String(finalTotalDays); // update with new total days value
        ruleTwentyFour.param2 = JSON.stringify(leaveDaysObj); // update with new leave days object
        // Keep all other properties as they are
      }

      // Generate final JSON using your helper
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 24 || r.ruleId === "24",
          newValue: ruleTwentyFour, // update ruleId=24 object
        },
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      toast.success("Leave settings updated successfully!");
    } catch (error) {
      console.error("Error saving leave settings:", error);
      toast.error("Failed to update leave settings.");
    }
  };

  const leaveCategories = [
    "Maternity Leave",
    "Marriage Leave",
    "Paternity Leave",
    "Sick Leave",
    "Casual Leave",
    "Earned leave",
    "Without Pay Leave",
    "Rest Leave",
    "Others",
  ];

  const totalFromLeaves = calculateTotalFromLeaves();

  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <span className="text-sm text-gray-700 font-medium">
              Total Days
            </span>
          </div>
          <div className="flex justify-end">
            <input
              type="number"
              value={totalDays}
              onChange={(e) => handleTotalDaysChange(e.target.value)}
              placeholder="0"
              min="0"
              className="w-50 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
            />
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Leave Categories
        </h3>

        <div className="space-y-3">
          {leaveCategories.map((category) => (
            <div key={category} className="grid grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-sm text-gray-700">{category}</span>
              </div>
              <div className="flex justify-end">
                <input
                  type="number"
                  value={leaveDays[category]}
                  onChange={(e) =>
                    handleLeaveDayChange(category, e.target.value)
                  }
                  placeholder="0"
                  min="0"
                  className="w-50 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#004368] focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Display calculated total */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-6 items-center">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Total Leave Days
              </span>
            </div>
            <div className="flex justify-end">
              <span className="text-sm font-semibold text-gray-900">
                {totalFromLeaves} days
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <p className="mb-2">
          Total leave count means all the days you can take off in a year. It
          includes vacation days, public holidays, sick leave, and other special
          leaves. The exact number depends on your country's laws and your
          company's rules.
        </p>
        <p className="mb-2">How it works:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Set individual leave categories - total updates automatically</li>
          <li>Set total days - individual categories adjust proportionally</li>
          <li>Total is always the sum of all leave categories</li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        disabled={updating || totalFromLeaves <= 0}
        className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
