import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import image from "@/constants/image";
import { useEditEmployeeStore } from "@/zustand/useEditEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useAttendanceData } from "@/hook/useAttendanceData";
import getWeekendAndHolidayDates from "@/lib/getWeekendAndHolidayDates";

export const ReplacementDayForm = () => {
  const [replacementDays, setReplacementDays] = useState([]);
  const [openPopovers, setOpenPopovers] = useState({});
  const [selectedDates, setSelectedDates] = useState({});
  const { selectedEmployee } = useEditEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();
  const { Attendance } = useAttendanceData();

  // Use refs to track previous values and prevent infinite loops
  const prevSalaryRulesRef = useRef(null);
  const prevEmployeeIdRef = useRef(null);
  const prevAttendanceRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Memoize the generated dates with deep equality check
  const generatedDates = useMemo(() => {
    try {
      if (
        !selectedEmployee?.salaryRules ||
        !Attendance ||
        !selectedEmployee?.employeeId
      ) {
        return [];
      }

      const salaryRulesStr = JSON.stringify(selectedEmployee.salaryRules);
      const attendanceStr = JSON.stringify(Attendance);
      const employeeId = selectedEmployee.employeeId;

      // Check if values have actually changed
      if (
        salaryRulesStr === prevSalaryRulesRef.current?.salaryRulesStr &&
        attendanceStr === prevAttendanceRef.current?.attendanceStr &&
        employeeId === prevEmployeeIdRef.current?.employeeId &&
        isInitializedRef.current
      ) {
        return prevSalaryRulesRef.current?.generatedDates || [];
      }

      const dates = getWeekendAndHolidayDates(
        selectedEmployee.salaryRules,
        Attendance,
        selectedEmployee.employeeId
      );

      // Store current values
      prevSalaryRulesRef.current = {
        salaryRulesStr,
        generatedDates: dates,
      };
      prevAttendanceRef.current = { attendanceStr };
      prevEmployeeIdRef.current = { employeeId };

      return dates || [];
    } catch (error) {
      console.error("Error generating dates:", error);
      return [];
    }
  }, [selectedEmployee?.salaryRules, Attendance, selectedEmployee?.employeeId]);

  // Stable initialize function
  const initializeReplacementDays = useCallback(() => {
    if (!selectedEmployee?.salaryRules || !Attendance) {
      return [];
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      let allReplacementDays = [];

      // Load existing replacement days
      if (salaryRules.replaceDays) {
        const replaceDays =
          typeof salaryRules.replaceDays === "string"
            ? JSON.parse(salaryRules.replaceDays)
            : salaryRules.replaceDays || [];

        // Transform existing data for UI
        const transformedDays = replaceDays.map((day, index) => ({
          id: day.id || index + 1,
          date: day.date,
          selectedDate: day.rdate ? new Date(day.rdate) : null,
          hasReplacement: !!day.rdate,
        }));

        allReplacementDays = [...transformedDays];
      }

      // Add generated dates if any
      if (generatedDates && generatedDates.length > 0) {
        // Get existing dates to avoid duplicates
        const existingDates = allReplacementDays.map((day) => day.date);

        // Add new dates from generated list
        generatedDates.forEach((generatedDate) => {
          if (!existingDates.includes(generatedDate)) {
            // Generate a unique ID for new entries
            const newId =
              allReplacementDays.length > 0
                ? Math.max(...allReplacementDays.map((d) => d.id || 0)) + 1
                : 1;

            allReplacementDays.push({
              id: newId,
              date: generatedDate,
              selectedDate: null,
              hasReplacement: false,
            });
          }
        });
      }

      return allReplacementDays;
    } catch (error) {
      console.error("Error parsing replacement days:", error);
      return [];
    }
  }, [selectedEmployee?.salaryRules, Attendance, generatedDates]);

  // Load replacement days - with guard against infinite loops
  useEffect(() => {
    // Only run if we have the necessary data
    if (!selectedEmployee?.salaryRules || !Attendance) {
      return;
    }

    // Create a stable key to check if data has changed
    const currentKey = `${JSON.stringify(
      selectedEmployee.salaryRules
    )}-${JSON.stringify(Attendance)}`;

    // Skip if data hasn't changed and we've already initialized
    if (
      isInitializedRef.current &&
      currentKey === prevSalaryRulesRef.current?.dataKey
    ) {
      return;
    }

    const initializedDays = initializeReplacementDays();

    // Only update if days have actually changed
    const currentDaysStr = JSON.stringify(initializedDays);
    const prevDaysStr = JSON.stringify(replacementDays);

    if (currentDaysStr !== prevDaysStr) {
      setReplacementDays(initializedDays);

      // Initialize selected dates state
      const initialSelectedDates = {};
      initializedDays.forEach((day) => {
        if (!day.hasReplacement) {
          initialSelectedDates[day.id] = day.selectedDate;
        }
      });
      setSelectedDates(initialSelectedDates);

      // Mark as initialized and store current key
      isInitializedRef.current = true;
      if (prevSalaryRulesRef.current) {
        prevSalaryRulesRef.current.dataKey = currentKey;
      }
    }
  }, [
    initializeReplacementDays,
    selectedEmployee?.salaryRules,
    Attendance,
    replacementDays,
  ]);

  const handleDateSelect = (id, date) => {
    if (!date) return;

    const fixedDate = (() => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      return new Date(year, month, day);
    })();

    const replacementDay = replacementDays.find((d) => d.id === id);
    if (replacementDay && replacementDay.hasReplacement) {
      toast.error("This date already has a replacement and cannot be modified");
      return;
    }

    setSelectedDates((prev) => ({
      ...prev,
      [id]: fixedDate,
    }));

    setOpenPopovers((prev) => ({ ...prev, [id]: false }));
  };

  const togglePopover = useCallback(
    (id, isOpen) => {
      const day = replacementDays.find((d) => d.id === id);
      if (day && day.hasReplacement) {
        toast.error(
          "This date already has a replacement and cannot be modified"
        );
        return;
      }
      setOpenPopovers((prev) => ({ ...prev, [id]: isOpen }));
    },
    [replacementDays]
  );

  const formatDateForStorage = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}T00:00:00.000`;
  };

  const handleSave = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    const hasSelectedDates = Object.values(selectedDates).some(
      (date) => date !== null
    );
    if (!hasSelectedDates) {
      toast.error("Please select at least one replacement date");
      return;
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = selectedEmployee.employeeId.toString();

      let ruleTwelve = existingRules.find(
        (rule) => rule.ruleId === 12 || rule.ruleId === "12"
      );

      if (!ruleTwelve) {
        ruleTwelve = {
          id: Math.floor(10 + Math.random() * 90),
          empId: empId,
          ruleId: "12",
          ruleStatus: 1,
          param1: null,
          param2: null,
          param3: null,
          param4: null,
          param5: null,
          param6: null,
        };
      }

      const updatedReplaceDays = replacementDays.map((day) => {
        if (day.hasReplacement) {
          return {
            ...day,
          };
        }

        const selectedDate = selectedDates[day.id];
        if (selectedDate) {
          return {
            ...day,
            selectedDate: selectedDate,
            hasReplacement: true,
          };
        }

        return day;
      });

      const apiReplaceDays = updatedReplaceDays.map((day) => ({
        id: day.id,
        empId: Number(empId),
        date: day.date,
        rdate: day.selectedDate ? formatDateForStorage(day.selectedDate) : null,
      }));

      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 12 || r.ruleId === "12",
          newValue: ruleTwelve,
        },
        replaceDays: apiReplaceDays,
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      // Update state after successful save
      setReplacementDays(updatedReplaceDays);
      setSelectedDates({});
      toast.success("Replacement days saved successfully!");
    } catch (error) {
      console.error("Error saving replacement days:", error);
      toast.error("Failed to save replacement days.");
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const formatSelectedDate = (date) => {
    if (!date) return "";
    try {
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const pendingCount = replacementDays.filter(
    (day) => !day.hasReplacement
  ).length;
  const completedCount = replacementDays.filter(
    (day) => day.hasReplacement
  ).length;
  const newlySelectedCount = Object.values(selectedDates).filter(
    (date) => date !== null
  ).length;

  const handleDelete = async () => {
    try {
      const salaryRules = selectedEmployee.salaryRules;
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        deleteRuleId: 12,
      });
      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      // Reset and reinitialize
      isInitializedRef.current = false;
      const initializedDays = initializeReplacementDays();
      setReplacementDays(initializedDays);
      setSelectedDates({});

      toast.success("Shift rules deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting shift rules:", error);
      toast.error("Failed to delete shift rules.");
    }
  };

  // Memoize the render logic for each row to prevent unnecessary re-renders
  const renderRow = useCallback(
    (day) => {
      const isCompleted = day.hasReplacement;
      const selectedDate = selectedDates[day.id];

      return (
        <tr key={day.id} className="border-b last:border-b-0 hover:bg-gray-50">
          <td className="py-3 px-4 text-sm text-gray-900">{day.id}</td>
          <td className="py-3 px-4 text-sm text-gray-900 text-right">
            {formatDateForDisplay(day.date)}
          </td>
          <td className="py-3 px-4 text-right">
            {isCompleted ? (
              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-700 bg-green-50 px-3 py-1 rounded border border-green-200">
                  {formatSelectedDate(day.selectedDate)}
                </span>
              </div>
            ) : (
              <Popover
                open={openPopovers[day.id]}
                onOpenChange={(isOpen) => togglePopover(day.id, isOpen)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-48 justify-between font-normal bg-white border-gray-300 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={image.calendar}
                        alt="calendar"
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">
                        {selectedDate
                          ? formatSelectedDate(selectedDate)
                          : "Select date"}
                      </span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => handleDateSelect(day.id, date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </td>
        </tr>
      );
    },
    [openPopovers, selectedDates, togglePopover]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Replacement Day
        </h1>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 border-b">
                SL
              </th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900 border-b">
                Original Date
              </th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900 border-b">
                Replacement Date
              </th>
            </tr>
          </thead>
          <tbody>
            {replacementDays.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-8 px-4 text-center text-gray-500">
                  No replacement days found
                </td>
              </tr>
            ) : (
              replacementDays.map(renderRow)
            )}
          </tbody>
        </table>
      </div>

      {/* Info Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">
          Replacement Days Information
        </h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>
            <strong>Total Days:</strong> {replacementDays.length}
          </p>
          <p>
            <strong>Completed Replacements:</strong> {completedCount}
          </p>
          <p>
            <strong>Pending Replacements:</strong> {pendingCount}
          </p>
          <p>
            <strong>Newly Selected:</strong> {newlySelectedCount}
          </p>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Date</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Employees without overtime options will have weekend or holiday
              attendance automatically recognized as replacement days. If this
              option is checked and an employee without paid overtime works on
              weekends, the software will automatically recognize weekend or
              holiday attendance and display the dates here as replacement days
              for future leave requests.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span className="text-red-500 font-medium">
              Note: Once a replacement date is set, it cannot be modified or
              removed.
            </span>
          </li>
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex items-center w-full justify-between mt-4 gap-4">
        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={updating}
          className="w-[50%] bg-red-500 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Deleting..." : "Delete"}
        </button>
        {/* Save */}
        <button
          onClick={handleSave}
          disabled={updating || newlySelectedCount === 0}
          className="w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
