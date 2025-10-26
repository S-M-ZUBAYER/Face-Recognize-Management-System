import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";

export const HolidayForm = () => {
  const [specialDates, setSpecialDates] = useState([]);
  const { selectedEmployee } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Load existing holidays from selectedEmployee
  useEffect(() => {
    if (selectedEmployee?.salaryRules?.holidays) {
      try {
        const holidays =
          typeof selectedEmployee.salaryRules.holidays === "string"
            ? JSON.parse(selectedEmployee.salaryRules.holidays)
            : selectedEmployee.salaryRules.holidays;

        if (Array.isArray(holidays)) {
          // Convert holiday strings to Date objects without timezone issues
          const holidayDates = holidays
            .map((holiday) => {
              if (typeof holiday === "string") {
                // Parse the date string without timezone offset
                const dateStr = holiday
                  .replace("T00:00:00.000", "")
                  .replace("T18:00:00.000Z", "");
                const [year, month, day] = dateStr.split("-");
                return new Date(
                  parseInt(year),
                  parseInt(month) - 1,
                  parseInt(day)
                );
              }
              return holiday;
            })
            .filter((date) => !isNaN(date.getTime())); // Filter out invalid dates

          setSpecialDates(holidayDates);
        }
      } catch (error) {
        console.error("Error parsing holidays:", error);
        setSpecialDates([]);
      }
    }
  }, [selectedEmployee]);

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

  // Format date for storage (YYYY-MM-DDTHH:mm:ss.sss format without Z)
  const formatDateForStorage = (date) => {
    if (!date) return "";

    // Create date without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Return in format: 2025-10-30T00:00:00.000 (without Z)
    return `${year}-${month}-${day}T00:00:00.000`;
  };

  // Save holidays
  const handleSave = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    try {
      const existingSalaryRules = selectedEmployee?.salaryRules || {
        empId: selectedEmployee?.employeeId || 0, // number
        rules: "[]",
        holidays: "[]",
        generalDays: "[]",
        replaceDays: "[]",
        punchDocuments: "[]",
        timeTables: "[]",
        m_leaves: "[]",
        mar_leaves: "[]",
        p_leaves: "[]",
        s_leaves: "[]",
        c_leaves: "[]",
        e_leaves: "[]",
        w_leaves: "[]",
        r_leaves: "[]",
        o_leaves: "[]",
      };

      // Parse existing rules
      const parsedRules =
        typeof existingSalaryRules.rules === "string"
          ? JSON.parse(existingSalaryRules.rules)
          : existingSalaryRules.rules || [];

      // Find or create rule with ruleId = 1
      let ruleOne = parsedRules.find(
        (rule) => rule.ruleId === 1 || rule.ruleId === "1"
      );

      if (!ruleOne) {
        // Create new rule with ruleId = 1 if it doesn't exist
        ruleOne = {
          empId: selectedEmployee.employeeId.toString(), // string
          ruleId: "1", // string
          ruleStatus: 1, // number
          param1: null,
          param2: null,
          param3: null,
          param4: null,
          param5: null,
          param6: null,
        };
      } else {
        // Update the existing rule - ensure correct data types
        ruleOne = {
          ...ruleOne,
          id:
            typeof ruleOne.id === "string" ? parseInt(ruleOne.id) : ruleOne.id, // ensure number
          empId: ruleOne.empId.toString(), // ensure string
          ruleId: "1", // ensure string
          ruleStatus:
            typeof ruleOne.ruleStatus === "string"
              ? parseInt(ruleOne.ruleStatus)
              : ruleOne.ruleStatus, // ensure number
          // Ensure all params are properly formatted
          param1:
            ruleOne.param1 !== null && typeof ruleOne.param1 !== "string"
              ? JSON.stringify(ruleOne.param1)
              : ruleOne.param1,
          param2:
            ruleOne.param2 !== null && typeof ruleOne.param2 !== "string"
              ? JSON.stringify(ruleOne.param2)
              : ruleOne.param2,
          param3:
            ruleOne.param3 !== null && typeof ruleOne.param3 !== "string"
              ? String(ruleOne.param3)
              : ruleOne.param3,
          param4:
            ruleOne.param4 !== null && typeof ruleOne.param4 !== "string"
              ? String(ruleOne.param4)
              : ruleOne.param4,
          param5:
            ruleOne.param5 !== null && typeof ruleOne.param5 !== "string"
              ? String(ruleOne.param5)
              : ruleOne.param5,
          param6:
            ruleOne.param6 !== null && typeof ruleOne.param6 !== "string"
              ? String(ruleOne.param6)
              : ruleOne.param6,
        };
      }

      // Fix other rules to ensure consistent data types
      const fixedOtherRules = parsedRules
        .filter((rule) => rule.ruleId !== 1 && rule.ruleId !== "1")
        .map((rule) => ({
          ...rule,
          id: typeof rule.id === "string" ? parseInt(rule.id) : rule.id, // number
          empId: rule.empId.toString(), // string
          ruleId:
            typeof rule.ruleId === "number"
              ? rule.ruleId.toString()
              : rule.ruleId, // string
          ruleStatus:
            typeof rule.ruleStatus === "string"
              ? parseInt(rule.ruleStatus)
              : rule.ruleStatus, // number
          // Ensure all params are strings or null
          param1:
            rule.param1 !== null && typeof rule.param1 !== "string"
              ? JSON.stringify(rule.param1)
              : rule.param1,
          param2:
            rule.param2 !== null && typeof rule.param2 !== "string"
              ? JSON.stringify(rule.param2)
              : rule.param2,
          param3:
            rule.param3 !== null && typeof rule.param3 !== "string"
              ? String(rule.param3)
              : rule.param3,
          param4:
            rule.param4 !== null && typeof rule.param4 !== "string"
              ? String(rule.param4)
              : rule.param4,
          param5:
            rule.param5 !== null && typeof rule.param5 !== "string"
              ? String(rule.param5)
              : rule.param5,
          param6:
            rule.param6 !== null && typeof rule.param6 !== "string"
              ? String(rule.param6)
              : rule.param6,
        }));

      const updatedRules = [ruleOne, ...fixedOtherRules];

      // Format holidays for storage - without timezone (Z)
      const holidayArray = specialDates.map((date) =>
        formatDateForStorage(date)
      );

      // Update salary rules with correct data types
      const updatedSalaryRules = {
        empId:
          typeof existingSalaryRules.empId === "string"
            ? parseInt(existingSalaryRules.empId)
            : existingSalaryRules.empId, // number (not string!)
        rules: JSON.stringify(updatedRules), // stringified array
        holidays: JSON.stringify(holidayArray), // stringified array
        generalDays: existingSalaryRules.generalDays || "[]",
        replaceDays: existingSalaryRules.replaceDays || "[]",
        punchDocuments: existingSalaryRules.punchDocuments || "[]",
        timeTables: existingSalaryRules.timeTables || "[]",
        m_leaves: existingSalaryRules.m_leaves || "[]",
        mar_leaves: existingSalaryRules.mar_leaves || "[]",
        p_leaves: existingSalaryRules.p_leaves || "[]",
        s_leaves: existingSalaryRules.s_leaves || "[]",
        c_leaves: existingSalaryRules.c_leaves || "[]",
        e_leaves: existingSalaryRules.e_leaves || "[]",
        w_leaves: existingSalaryRules.w_leaves || "[]",
        r_leaves: existingSalaryRules.r_leaves || "[]",
        o_leaves: existingSalaryRules.o_leaves || "[]",
      };

      const salaryRulesString = JSON.stringify(updatedSalaryRules);
      const payload = { salaryRules: salaryRulesString };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      console.log(payload);
      toast.success("Holidays updated successfully!");
    } catch (error) {
      console.error("Error saving holidays:", error);
      toast.error("Failed to update holidays.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mt-4 mx-[8vw]">
        <Calendar
          mode="multiple"
          selected={specialDates}
          onSelect={handleCalendarSelect}
          className="w-[25vw]"
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
              Select national holiday, click the date to choose.When the
              selected date turns blue,it indicates that it is a holiday and no
              attendance is required.the selection will be automatically saved
              (set according to your company's actual situation)
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
