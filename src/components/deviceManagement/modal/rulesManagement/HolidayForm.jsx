import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { parseNormalData } from "@/lib/parseNormalData";
import {
  createGlobalSalaryRules,
  updateGlobalSalaryRules,
} from "../../../../utils/updateCreateGlobal";
import { useGlobalStore } from "@/zustand/useGlobalStore";

export const HolidayForm = () => {
  const [specialDates, setSpecialDates] = useState([]);
  const selectedRule = useGlobalStore.getState().selectedRule();
  const { updateSelectedRule } = useGlobalStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // console.log(selectedRule);

  // 🟦 Parse stored holiday strings → Date objects (local, no offset)
  useEffect(() => {
    if (!selectedRule?.salaryRules?.holidays) {
      setSpecialDates([]);
      return;
    }

    try {
      const raw = selectedRule.salaryRules.holidays;
      const parsed =
        typeof raw === "string"
          ? JSON.parse(raw)
          : Array.isArray(raw)
            ? raw
            : [];

      const dates = parsed
        .map((str) => {
          if (typeof str !== "string") return null;
          const [y, m, d] = str.split("T")[0].split("-");
          // 🟢 Create a date using local time only (no UTC conversion)
          return new Date(Number(y), Number(m) - 1, Number(d), 12);
        })
        .filter(Boolean);

      setSpecialDates(dates);
    } catch (err) {
      console.error("Error parsing holidays:", err);
      setSpecialDates([]);
    }
  }, [selectedRule]);

  // 🟦 Handle selection — keep dates in local time, normalized
  const handleCalendarSelect = (dates) => {
    if (!dates || dates.length === 0) {
      setSpecialDates([]);
      return;
    }

    // Store dates in "local noon" to prevent timezone shifts
    const normalized = dates.map(
      (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12),
    );
    setSpecialDates(normalized);
  };

  // 🟦 Format for backend (always YYYY-MM-DDT00:00:00.000)
  const formatDateForStorage = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}T00:00:00.000`;
  };

  // 🟦 Save handler
  const handleSave = async () => {
    // if (!selectedEmployee?.employeeId) {
    //   toast.error("No employee selected");
    //   return;
    // }

    setIsSaving(true);

    try {
      const empId = parseFloat(999);
      const salaryRules = selectedRule.salaryRules;
      const existingRules = Array.isArray(salaryRules.rules)
        ? salaryRules.rules
        : [];

      // Find or create ruleId "1"
      let ruleOne = existingRules.find(
        (r) => r.ruleId === "1" || r.ruleId === 1,
      );
      if (!ruleOne) {
        ruleOne = {
          id: Math.floor(10 + Math.random() * 90),
          empId,
          ruleId: "1",
          ruleStatus: 1,
          param1: null,
          param2: null,
          param3: null,
          param4: null,
          param5: null,
          param6: null,
        };
      } else {
        ruleOne.empId = empId.toString();
      }

      const formattedHolidays = specialDates.map(formatDateForStorage);

      // console.log(formattedHolidays);

      // 🧩 Build final JSON
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        holidays: formattedHolidays, // raw array, helper stringifies
        rules: {
          filter: (r) => r.ruleId === 1 || r.ruleId === "1",
          newValue: ruleOne,
        },
      });

      // console.log("rules:", {
      //   filter: (r) => r.ruleId === "1" || r.ruleId === 1,
      //   newValue: ruleOne,
      // });

      if (selectedRule) {
        await updateGlobalSalaryRules({
          salaryRules: JSON.stringify(updatedJSON),
        });
      } else {
        await createGlobalSalaryRules({
          salaryRules: JSON.stringify(updatedJSON),
        });
      }
      // Update Zustand store
      updateSelectedRule({ salaryRules: parseNormalData(updatedJSON) });

      toast.success("Holidays updated successfully!");
    } catch (error) {
      console.error("Error saving holidays:", error);
      toast.error("Failed to update holidays.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedRule?.salaryRules?.rules) {
      toast.error("No existing holiday settings to delete.");
      return;
    }

    setIsDeleting(true);
    try {
      const salaryRules = selectedRule.salaryRules;
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        deleteRuleId: 1,
      });

      await updateGlobalSalaryRules({
        salaryRules: JSON.stringify(updatedJSON),
      });

      // Update Zustand store
      updateSelectedRule({ salaryRules: parseNormalData(updatedJSON) });
      toast.success("Shift rules deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting shift rules:", error);
      toast.error("Failed to delete shift rules.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mt-4 mx-[8vw]">
        <Calendar
          mode="multiple"
          selected={specialDates}
          onSelect={handleCalendarSelect}
          className="w-[22vw]"
          modifiersStyles={{
            today: { backgroundColor: "transparent", color: "inherit" },
          }}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              Select national holidays. When a date turns blue, it’s marked as a
              holiday (no attendance required). Click "Save" to confirm.
            </span>
          </li>
        </ul>
      </div>

      <div className=" flex items-center w-full justify-between mt-4 gap-4">
        {/* Delete */}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-[50%]  bg-red-500 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className=" w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
