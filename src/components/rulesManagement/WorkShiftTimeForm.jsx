import React, { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { Plus, Trash2, Calendar, Copy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ExcelFormatExample from "./ExcelFormatExample";
import toast from "react-hot-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { TimeRangePicker } from "@/components/TimePicker";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import { useUserStore } from "@/zustand/useUserStore";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { parseNormalData } from "@/lib/parseNormalData";
import useUpdateProgressStore from "@/zustand/updateProgressStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const WorkShiftTimeForm = () => {
  const { employees, updateEmployee: storeEmployeeUpdate } = useEmployeeStore();
  const Employees = employees();
  const [shiftType, setShiftType] = useState("normal");
  const [specialDates, setSpecialDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { setGlobalRulesIds } = useUserStore();

  const updateProgressStore = useUpdateProgressStore();

  const { updateEmployee, updating } = useSingleEmployeeDetails();

  const [workingTimes, setWorkingTimes] = useState([
    { id: 1, label: "Working Time 1", startTime: "08:00", endTime: "12:00" },
    { id: 2, label: "Working Time 2", startTime: "13:00", endTime: "17:00" },
  ]);

  const [overtimes, setOvertimes] = useState([
    { id: 1, label: "Overtime 1", startTime: "18:00", endTime: "20:00" },
  ]);

  // Date-wise configuration storage
  const [dateConfigs, setDateConfigs] = useState({});

  // Bulk configuration states
  const [bulkConfigDialog, setBulkConfigDialog] = useState(false);
  const [bulkWorkingTimes, setBulkWorkingTimes] = useState([
    { id: 1, label: "Working Time 1", startTime: "08:00", endTime: "12:00" },
  ]);
  const [bulkOvertimes, setBulkOvertimes] = useState([
    { id: 1, label: "Overtime 1", startTime: "18:00", endTime: "20:00" },
  ]);

  const formatDateForDisplay = (date) => {
    if (!date) return "";

    if (typeof date === "string") {
      const [year, month, day] = date.split("-");
      const dateObj = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
      );
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // const formatDateForStorage = (date) => {
  //   if (!date) return "";

  //   if (date instanceof Date) {
  //     const year = date.getFullYear();
  //     const month = String(date.getMonth() + 1).padStart(2, "0");
  //     const day = String(date.getDate()).padStart(2, "0");
  //     return `${year}-${month}-${day}`;
  //   }

  //   return date;
  // };

  const formatDateForUI = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Get current config for selected date
  const getCurrentDateConfig = (dateStr) => {
    if (!dateStr) return null;
    return (
      dateConfigs[dateStr] || {
        workingTimes: [],
        overtimes: [],
      }
    );
  };

  // Update date config
  const updateDateConfig = useCallback((dateStr, config) => {
    setDateConfigs((prev) => ({
      ...prev,
      [dateStr]: config,
    }));
  }, []);

  // Initialize config for a date if it doesn't exist
  const ensureDateConfig = useCallback(
    (dateStr) => {
      if (!dateConfigs[dateStr]) {
        const defaultConfig = {
          workingTimes: [
            {
              id: 1,
              label: "Working Time 1",
              startTime: "08:00",
              endTime: "12:00",
            },
          ],
          overtimes: [
            {
              id: 1,
              label: "Overtime 1",
              startTime: "18:00",
              endTime: "20:00",
            },
          ],
        };
        setDateConfigs((prev) => ({
          ...prev,
          [dateStr]: defaultConfig,
        }));
        return defaultConfig;
      }
      return dateConfigs[dateStr];
    },
    [dateConfigs],
  );

  // ===== Add handlers for normal mode =====
  const addWorkingTime = () => {
    const newId = Math.max(...workingTimes.map((w) => w.id), 0) + 1;
    setWorkingTimes([
      ...workingTimes,
      {
        id: newId,
        label: `Working Time ${newId}`,
        startTime: "09:00",
        endTime: "18:00",
      },
    ]);
  };

  const addOvertime = () => {
    const newId = Math.max(...overtimes.map((o) => o.id), 0) + 1;
    setOvertimes([
      ...overtimes,
      {
        id: newId,
        label: `Overtime ${newId}`,
        startTime: "18:00",
        endTime: "22:00",
      },
    ]);
  };

  // ===== Handlers for date-specific configuration =====
  const addWorkingTimeToDate = (dateStr) => {
    if (!dateStr) return;
    const config = ensureDateConfig(dateStr);
    const newId = Math.max(...config.workingTimes.map((w) => w.id || 0), 0) + 1;

    const newWorkingTimes = [
      ...config.workingTimes,
      {
        id: newId,
        label: `Working Time ${newId}`,
        startTime: "09:00",
        endTime: "18:00",
      },
    ];

    updateDateConfig(dateStr, {
      ...config,
      workingTimes: newWorkingTimes,
    });
  };

  const addOvertimeToDate = (dateStr) => {
    if (!dateStr) return;
    const config = ensureDateConfig(dateStr);
    const newId = Math.max(...config.overtimes.map((o) => o.id || 0), 0) + 1;

    const newOvertimes = [
      ...config.overtimes,
      {
        id: newId,
        label: `Overtime ${newId}`,
        startTime: "18:00",
        endTime: "22:00",
      },
    ];

    updateDateConfig(dateStr, {
      ...config,
      overtimes: newOvertimes,
    });
  };

  const updateWorkingTimeForDate = (dateStr, id, field, value) => {
    if (!dateStr) return;
    const config = ensureDateConfig(dateStr);

    updateDateConfig(dateStr, {
      ...config,
      workingTimes: config.workingTimes.map((wt) =>
        wt.id === id ? { ...wt, [field]: value } : wt,
      ),
    });
  };

  const updateOvertimeForDate = (dateStr, id, field, value) => {
    if (!dateStr) return;
    const config = ensureDateConfig(dateStr);

    updateDateConfig(dateStr, {
      ...config,
      overtimes: config.overtimes.map((ot) =>
        ot.id === id ? { ...ot, [field]: value } : ot,
      ),
    });
  };

  const deleteWorkingTimeFromDate = (dateStr, id) => {
    if (!dateStr) return;
    const config = dateConfigs[dateStr];
    if (!config) return;

    if (config.workingTimes.length <= 1) {
      toast.error("At least one working time is required");
      return;
    }

    updateDateConfig(dateStr, {
      ...config,
      workingTimes: config.workingTimes.filter((wt) => wt.id !== id),
    });
  };

  const deleteOvertimeFromDate = (dateStr, id) => {
    if (!dateStr) return;
    const config = dateConfigs[dateStr];
    if (!config) return;

    updateDateConfig(dateStr, {
      ...config,
      overtimes: config.overtimes.filter((ot) => ot.id !== id),
    });
  };

  // ===== Bulk operations handlers =====
  const addBulkWorkingTime = () => {
    const newId = Math.max(0, ...bulkWorkingTimes.map((w) => w.id)) + 1;
    setBulkWorkingTimes([
      ...bulkWorkingTimes,
      {
        id: newId,
        label: `Working Time ${newId}`,
        startTime: "09:00",
        endTime: "18:00",
      },
    ]);
  };

  const addBulkOvertime = () => {
    const newId = Math.max(0, ...bulkOvertimes.map((o) => o.id)) + 1;
    setBulkOvertimes([
      ...bulkOvertimes,
      {
        id: newId,
        label: `Overtime ${newId}`,
        startTime: "18:00",
        endTime: "22:00",
      },
    ]);
  };

  const removeBulkWorkingTime = (id) => {
    if (bulkWorkingTimes.length > 1) {
      setBulkWorkingTimes(bulkWorkingTimes.filter((wt) => wt.id !== id));
    } else {
      toast.error("At least one working time is required");
    }
  };

  const removeBulkOvertime = (id) => {
    setBulkOvertimes(bulkOvertimes.filter((ot) => ot.id !== id));
  };

  const updateBulkWorkingTime = (id, field, value) => {
    setBulkWorkingTimes(
      bulkWorkingTimes.map((wt) =>
        wt.id === id ? { ...wt, [field]: value } : wt,
      ),
    );
  };

  const updateBulkOvertime = (id, field, value) => {
    setBulkOvertimes(
      bulkOvertimes.map((ot) =>
        ot.id === id ? { ...ot, [field]: value } : ot,
      ),
    );
  };

  const applyBulkConfig = () => {
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    if (bulkWorkingTimes.length === 0) {
      toast.error("Please add at least one working time");
      return;
    }

    const newConfigs = { ...dateConfigs };

    selectedDates.forEach((dateStr) => {
      newConfigs[dateStr] = {
        workingTimes: bulkWorkingTimes.map((wt) => ({ ...wt })),
        overtimes: bulkOvertimes.map((ot) => ({ ...ot })),
      };
    });

    setDateConfigs(newConfigs);
    setBulkConfigDialog(false);
    toast.success(`Configuration applied to ${selectedDates.length} date(s)`);
  };

  // ===== Normal mode handlers =====
  const updateWorkingTime = (id, field, value) => {
    setWorkingTimes((prev) =>
      prev.map((wt) => (wt.id === id ? { ...wt, [field]: value } : wt)),
    );
  };

  const updateOvertime = (id, field, value) => {
    setOvertimes((prev) =>
      prev.map((ot) => (ot.id === id ? { ...ot, [field]: value } : ot)),
    );
  };

  // Convert Excel time to HH:mm string
  const excelTimeToString = (excelTime) => {
    if (typeof excelTime === "number") {
      const totalMinutes = Math.round(excelTime * 24 * 60);
      const hours = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
      const minutes = (totalMinutes % 60).toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return excelTime || "00:00";
  };

  const handleCalendarSelect = (dates) => {
    if (dates) {
      const fixedDates = dates.map((date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      });
      setSpecialDates(fixedDates);

      // Reset selected dates when calendar selection changes
      if (fixedDates.length > 0) {
        setSelectedDates([fixedDates[0]]);
      } else {
        setSelectedDates([]);
      }
    } else {
      setSpecialDates([]);
      setSelectedDates([]);
    }
  };

  // Toggle date selection
  const toggleDateSelection = (dateStr) => {
    setSelectedDates((prev) => {
      if (prev.includes(dateStr)) {
        // If only one date is selected and we're removing it, select another if available
        if (prev.length === 1) {
          const otherDates = specialDates.filter((d) => d !== dateStr);
          return otherDates.length > 0 ? [otherDates[0]] : [];
        }
        return prev.filter((d) => d !== dateStr);
      } else {
        // Ensure the date has a config when selected
        ensureDateConfig(dateStr);
        return [...prev, dateStr];
      }
    });
  };

  // Select all dates in current month
  const selectAllDatesInMonth = () => {
    const datesInMonth = getDatesInCurrentMonth();
    datesInMonth.forEach((dateStr) => ensureDateConfig(dateStr));
    setSelectedDates(datesInMonth);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedDates([]);
  };

  // Get dates in current month
  const getDatesInCurrentMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    return specialDates.filter((dateStr) => {
      const [y, m] = dateStr.split("-").map(Number);
      return y === year && m - 1 === month;
    });
  };

  // Handle month change
  const handleMonthChange = (date) => {
    setCurrentMonth(date);
  };

  // ===== 📂 Excel Upload Handler =====
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const header = rows[0]?.map((h) => h?.toString().toLowerCase()) || [];
      if (
        !header.includes("type") ||
        !header.includes("start") ||
        !header.includes("end")
      ) {
        toast.error("Invalid Excel format! Please use the example format.");
        return;
      }

      const typeIndex = header.indexOf("type");
      const startIndex = header.indexOf("start");
      const endIndex = header.indexOf("end");

      const newWorking = [];
      const newOvertime = [];
      let workId = 1;
      let overId = 1;

      rows.slice(1).forEach((row) => {
        if (!row || row.length < Math.max(typeIndex, startIndex, endIndex) + 1)
          return;

        const type = (row[typeIndex] || "").toString().toLowerCase();
        const start = excelTimeToString(row[startIndex]);
        const end = excelTimeToString(row[endIndex]);

        if (type === "working") {
          newWorking.push({
            id: workId++,
            label: `Working Time ${workId - 1}`,
            startTime: start,
            endTime: end,
          });
        } else if (type === "overtime") {
          newOvertime.push({
            id: overId++,
            label: `Overtime ${overId - 1}`,
            startTime: start,
            endTime: end,
          });
        }
      });

      if (newWorking.length === 0 && newOvertime.length === 0) {
        toast.error("No valid rows found in Excel file!");
        return;
      }

      // Apply to selected dates if in special mode
      if (shiftType === "special" && selectedDates.length > 0) {
        const newConfigs = { ...dateConfigs };
        selectedDates.forEach((dateStr) => {
          const currentConfig = dateConfigs[dateStr] || {
            workingTimes: [],
            overtimes: [],
          };
          newConfigs[dateStr] = {
            workingTimes:
              newWorking.length > 0
                ? newWorking.map((wt) => ({ ...wt }))
                : currentConfig.workingTimes,
            overtimes:
              newOvertime.length > 0
                ? newOvertime.map((ot) => ({ ...ot }))
                : currentConfig.overtimes,
          };
        });
        setDateConfigs(newConfigs);
        toast.success(
          `Excel data applied to ${selectedDates.length} selected date(s)`,
        );
      } else {
        setWorkingTimes(newWorking.length ? newWorking : workingTimes);
        setOvertimes(newOvertime.length ? newOvertime : overtimes);
        toast.success("Shift times imported successfully!");
      }
    } catch (err) {
      console.error("Excel read error:", err);
      toast.error("Failed to read Excel file. Please check the format.");
    }
  };

  // ===== Save handler =====
  const handleSave = async () => {
    try {
      // Validation
      if (shiftType === "normal") {
        if (workingTimes.length === 0) {
          toast.error("Please add at least one working time before saving!");
          return;
        }
      }

      if (shiftType === "special") {
        if (specialDates.length === 0) {
          toast.error("Please select at least one special date!");
          return;
        }

        // Check each special date has at least one working time
        for (const date of specialDates) {
          const config = dateConfigs[date];
          if (!config || config.workingTimes.length === 0) {
            toast.error(
              `Please add at least one working time for ${formatDateForDisplay(date)}!`,
            );
            return;
          }
        }
      }

      // Check if any employees are selected
      if (Employees.length === 0) {
        toast.error("Please select at least one employee!");
        return;
      }

      updateProgressStore.startUpdate(Employees, "Work on Holiday");

      // Continue with saving for selected employees
      for (const emp of Employees) {
        if (!emp?.employeeId) {
          toast.error("Invalid employee data");
          continue;
        }

        const employeeName = emp.name || emp.employeeId;

        // Mark as processing
        updateProgressStore.updateProgress(employeeName, "processing");

        try {
          const employeeId = emp.employeeId.toString();
          const salaryRules = emp.salaryRules || {};
          const existingRules = Array.isArray(salaryRules.rules)
            ? salaryRules.rules
            : JSON.parse(salaryRules.rules || "[]");

          const existingRuleZero = existingRules.find(
            (r) => r.ruleId === 0 || r.ruleId === "0",
          );

          const workingTimesData = JSON.stringify(
            workingTimes.map((wt) => ({
              start: wt.startTime,
              end: wt.endTime,
            })),
          );

          const overtimeData = JSON.stringify(
            overtimes.map((ot) => ({ start: ot.startTime, end: ot.endTime })),
          );

          const normalizeParam = (v) =>
            Array.isArray(v) ? JSON.stringify(v) : (v ?? "");

          const ruleZero =
            shiftType === "normal"
              ? {
                  id:
                    existingRuleZero?.id || Math.floor(10 + Math.random() * 90),
                  empId: employeeId,
                  ruleId: "0",
                  ruleStatus: 1,
                  param1: normalizeParam(workingTimesData),
                  param2: normalizeParam(overtimeData),
                  param3: "normal",
                  param4: "",
                  param5: "",
                  param6: "",
                }
              : {
                  id:
                    existingRuleZero?.id || Math.floor(10 + Math.random() * 90),
                  empId: employeeId,
                  ruleId: "0",
                  ruleStatus: 1,
                  param1: "[]",
                  param2: "[]",
                  param3: "special",
                  param4: "",
                  param5: "",
                  param6: "",
                };
          const preTimeTables = salaryRules.timeTables || [];
          const timeTablesObjects = specialDates.map((date, index) => {
            const config = dateConfigs[date] || {
              workingTimes: [],
              overtimes: [],
            };

            return {
              id: index + 1,
              empId: employeeId,
              ruleId: "0",
              date: date,
              param1: config.workingTimes.map((wt) => ({
                start: wt.startTime,
                end: wt.endTime,
              })),
              param2: config.overtimes.map((ot) => ({
                start: ot.startTime,
                end: ot.endTime,
              })),
              param3: "",
              param4: "",
              param5: "",
              param6: "",
            };
          });

          const updatedJSON = finalJsonForUpdate(salaryRules, {
            empId: employeeId,
            timeTables: [...preTimeTables, ...timeTablesObjects],
            rules: {
              filter: (r) => r.ruleId === 0 || r.ruleId === "0",
              newValue: ruleZero,
            },
          });

          const payload = { salaryRules: JSON.stringify(updatedJSON) };

          await updateEmployee({
            mac: emp?.deviceMAC || "",
            id: employeeId,
            payload,
          });

          storeEmployeeUpdate(emp.employeeId, emp.deviceMAC || "", {
            salaryRules: parseNormalData(updatedJSON),
          });

          updateProgressStore.updateProgress(employeeName, "success");
        } catch (error) {
          console.error(`Error updating employee ${employeeName}:`, error);
          updateProgressStore.updateProgress(
            employeeName,
            "failed",
            error.message || "Update failed",
          );
        }
      }
      setGlobalRulesIds(0);
    } catch (error) {
      console.error("❌ Error saving shift rules:", error);
      toast.error("Failed to save shift configuration.");
    }
  };

  const datesInCurrentMonth = getDatesInCurrentMonth();
  const hasDatesInCurrentMonth = datesInCurrentMonth.length > 0;

  return (
    <div className="space-y-6">
      {/* Shift Type */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold mb-3 text-gray-700">
          Select Type
        </h3>
        <RadioGroup
          value={shiftType}
          onValueChange={setShiftType}
          className="flex gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem
              value="normal"
              id="normal"
              className="border-2 text-[#004368] data-[state=checked]:border-[#B0C5D0]"
            />
            <Label htmlFor="normal" className="text-sm">
              Normal
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem
              value="special"
              id="special"
              className="border-2 text-[#004368] data-[state=checked]:border-[#B0C5D0]"
            />
            <Label htmlFor="special" className="text-sm">
              Special Dates
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Special Dates Calendar */}
      {shiftType === "special" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              Select Special Dates
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Click on dates in the calendar to add them to your special dates
              list
            </p>
          </div>
          <div className="p-4 flex justify-center">
            <CalendarComponent
              mode="multiple"
              selected={specialDates.map((date) => new Date(date))}
              onSelect={handleCalendarSelect}
              onMonthChange={handleMonthChange}
              className="rounded-md"
              modifiersStyles={{
                today: {
                  backgroundColor: "transparent",
                  color: "inherit",
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Date-wise Configuration for Special Type */}
      {shiftType === "special" && specialDates.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Configure Dates
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {currentMonth.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  • {datesInCurrentMonth.length} date(s)
                </p>
              </div>
              {hasDatesInCurrentMonth && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllDatesInMonth}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllSelections}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                  {selectedDates.length > 1 && (
                    <Dialog
                      open={bulkConfigDialog}
                      onOpenChange={setBulkConfigDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-[#004368] text-white hover:bg-[#003152] text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Bulk Configure ({selectedDates.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="text-lg">
                            Bulk Configuration
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-700">
                              Applying to {selectedDates.length} selected
                              date(s):
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedDates.map((date) => (
                                <Badge
                                  key={date}
                                  variant="outline"
                                  className="bg-white"
                                >
                                  {formatDateForUI(date)}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <ScrollArea className="max-h-[50vh] pr-4">
                            {/* Bulk Working Times */}
                            <div className="mb-6">
                              <h4 className="text-sm font-medium mb-3 text-gray-700">
                                Working Times
                              </h4>
                              <div className="space-y-2">
                                {bulkWorkingTimes.map((wt) => (
                                  <TimeRangePicker
                                    key={wt.id}
                                    label={wt.label}
                                    startTime={wt.startTime}
                                    endTime={wt.endTime}
                                    onStartChange={(value) =>
                                      updateBulkWorkingTime(
                                        wt.id,
                                        "startTime",
                                        value,
                                      )
                                    }
                                    onEndChange={(value) =>
                                      updateBulkWorkingTime(
                                        wt.id,
                                        "endTime",
                                        value,
                                      )
                                    }
                                    removeFn={() =>
                                      removeBulkWorkingTime(wt.id)
                                    }
                                  />
                                ))}

                                <div className="w-full flex justify-end mt-2">
                                  <button
                                    onClick={addBulkWorkingTime}
                                    type="button"
                                    className="flex items-center gap-1 text-xs text-white font-medium bg-[#004368] px-3 py-1.5 rounded-sm hover:bg-[#003152] transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add Working Time
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Bulk Overtime */}
                            <div>
                              <h4 className="text-sm font-medium mb-3 text-gray-700">
                                Overtime
                              </h4>
                              <div className="space-y-2">
                                {bulkOvertimes.map((ot) => (
                                  <TimeRangePicker
                                    key={ot.id}
                                    label={ot.label}
                                    startTime={ot.startTime}
                                    endTime={ot.endTime}
                                    onStartChange={(value) =>
                                      updateBulkOvertime(
                                        ot.id,
                                        "startTime",
                                        value,
                                      )
                                    }
                                    onEndChange={(value) =>
                                      updateBulkOvertime(
                                        ot.id,
                                        "endTime",
                                        value,
                                      )
                                    }
                                    removeFn={() => removeBulkOvertime(ot.id)}
                                  />
                                ))}

                                <div className="w-full flex justify-end mt-2">
                                  <button
                                    onClick={addBulkOvertime}
                                    type="button"
                                    className="flex items-center gap-1 text-xs text-white font-medium bg-[#004368] px-3 py-1.5 rounded-sm hover:bg-[#003152] transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add Overtime
                                  </button>
                                </div>
                              </div>
                            </div>
                          </ScrollArea>

                          <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              onClick={() => setBulkConfigDialog(false)}
                              size="sm"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={applyBulkConfig}
                              className="bg-[#004368] text-white hover:bg-[#003152]"
                              size="sm"
                            >
                              Apply to {selectedDates.length} Date(s)
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            {hasDatesInCurrentMonth ? (
              <>
                {/* Date Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-6">
                  {datesInCurrentMonth.map((dateStr) => {
                    const isSelected = selectedDates.includes(dateStr);
                    const config = dateConfigs[dateStr];
                    const hasConfig = config && config.workingTimes?.length > 0;

                    return (
                      <div
                        key={dateStr}
                        className={`relative group rounded-lg border transition-all ${
                          isSelected
                            ? "border-[#004368] bg-[#004368]/5 ring-1 ring-[#004368]/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <button
                          onClick={() => toggleDateSelection(dateStr)}
                          className="w-full p-3 text-left"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-400">
                              {new Date(dateStr).toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </span>
                            {hasConfig && (
                              <Badge
                                variant="outline"
                                className="h-4 px-1 text-[8px] bg-green-50 text-green-700 border-green-200"
                              >
                                Configured
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              {dateStr.split("-")[2]}
                            </span>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-[#004368]" />
                            )}
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setSpecialDates((prev) =>
                              prev.filter((d) => d !== dateStr),
                            );
                            setSelectedDates((prev) =>
                              prev.filter((d) => d !== dateStr),
                            );
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                          title="Remove date"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Configuration Panel for Selected Date(s) */}
                {selectedDates.length === 1 ? (
                  // Single Date Configuration
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Configure {formatDateForUI(selectedDates[0])}
                      </h4>
                      <Badge variant="outline" className="bg-white">
                        Single Date Configuration
                      </Badge>
                    </div>

                    {/* Working Times for Selected Date */}
                    <div className="mb-6">
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Working Times
                      </h5>
                      <div className="space-y-2">
                        {getCurrentDateConfig(
                          selectedDates[0],
                        )?.workingTimes.map((wt) => (
                          <TimeRangePicker
                            key={wt.id}
                            label={wt.label}
                            startTime={wt.startTime}
                            endTime={wt.endTime}
                            onStartChange={(value) =>
                              updateWorkingTimeForDate(
                                selectedDates[0],
                                wt.id,
                                "startTime",
                                value,
                              )
                            }
                            onEndChange={(value) =>
                              updateWorkingTimeForDate(
                                selectedDates[0],
                                wt.id,
                                "endTime",
                                value,
                              )
                            }
                            removeFn={() =>
                              deleteWorkingTimeFromDate(selectedDates[0], wt.id)
                            }
                          />
                        ))}

                        <div className="w-full flex justify-end mt-2">
                          <button
                            onClick={() =>
                              addWorkingTimeToDate(selectedDates[0])
                            }
                            type="button"
                            className="flex items-center gap-1 text-xs text-white font-medium bg-[#004368] px-3 py-1.5 rounded-sm hover:bg-[#003152] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add Working Time
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Overtime for Selected Date */}
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Overtime
                      </h5>
                      <div className="space-y-2">
                        {getCurrentDateConfig(selectedDates[0])?.overtimes.map(
                          (ot) => (
                            <TimeRangePicker
                              key={ot.id}
                              label={ot.label}
                              startTime={ot.startTime}
                              endTime={ot.endTime}
                              onStartChange={(value) =>
                                updateOvertimeForDate(
                                  selectedDates[0],
                                  ot.id,
                                  "startTime",
                                  value,
                                )
                              }
                              onEndChange={(value) =>
                                updateOvertimeForDate(
                                  selectedDates[0],
                                  ot.id,
                                  "endTime",
                                  value,
                                )
                              }
                              removeFn={() =>
                                deleteOvertimeFromDate(selectedDates[0], ot.id)
                              }
                            />
                          ),
                        )}

                        <div className="w-full flex justify-end mt-2">
                          <button
                            onClick={() => addOvertimeToDate(selectedDates[0])}
                            type="button"
                            className="flex items-center gap-1 text-xs text-white font-medium bg-[#004368] px-3 py-1.5 rounded-sm hover:bg-[#003152] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add Overtime
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedDates.length > 1 ? (
                  // Multiple Dates Selected - Show Summary
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-blue-700 mb-2">
                      <span className="font-semibold">
                        {selectedDates.length}
                      </span>{" "}
                      dates selected
                    </p>
                    <p className="text-xs text-blue-600">
                      Click the "Bulk Configure" button above to apply the same
                      configuration to all selected dates
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">
                  No special dates in{" "}
                  {currentMonth.toLocaleString("default", { month: "long" })}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Select dates from the calendar above
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Normal Type - Working Times */}
      {shiftType === "normal" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              Normal Shift Configuration
            </h3>
          </div>
          <div className="p-4 space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">
                Working Times
              </h4>
              <div className="space-y-2">
                {workingTimes.map((wt) => (
                  <TimeRangePicker
                    key={wt.id}
                    label={wt.label}
                    startTime={wt.startTime}
                    endTime={wt.endTime}
                    onStartChange={(value) =>
                      updateWorkingTime(wt.id, "startTime", value)
                    }
                    onEndChange={(value) =>
                      updateWorkingTime(wt.id, "endTime", value)
                    }
                    removeFn={() => {
                      if (workingTimes.length > 1) {
                        setWorkingTimes(
                          workingTimes.filter((w) => w.id !== wt.id),
                        );
                      } else {
                        toast.error("At least one working time is required");
                      }
                    }}
                  />
                ))}

                <div className="w-full flex justify-end mt-2">
                  <button
                    onClick={addWorkingTime}
                    type="button"
                    className="flex items-center gap-1 text-xs text-white font-medium bg-[#004368] px-3 py-1.5 rounded-sm hover:bg-[#003152] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Working Time
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">
                Overtime
              </h4>
              <div className="space-y-2">
                {overtimes.map((ot) => (
                  <TimeRangePicker
                    key={ot.id}
                    label={ot.label}
                    startTime={ot.startTime}
                    endTime={ot.endTime}
                    onStartChange={(value) =>
                      updateOvertime(ot.id, "startTime", value)
                    }
                    onEndChange={(value) =>
                      updateOvertime(ot.id, "endTime", value)
                    }
                    removeFn={() => {
                      if (overtimes.length > 1) {
                        setOvertimes(overtimes.filter((o) => o.id !== ot.id));
                      } else {
                        toast.error("At least one overtime is required");
                      }
                    }}
                  />
                ))}

                <div className="w-full flex justify-end mt-2">
                  <button
                    onClick={addOvertime}
                    type="button"
                    className="flex items-center gap-1 text-xs text-white font-medium bg-[#004368] px-3 py-1.5 rounded-sm hover:bg-[#003152] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Overtime
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">
            Import from Excel
          </h3>
        </div>
        <div className="p-4">
          <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#004368]/30 transition-colors">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleExcelUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <div className="text-3xl">📊</div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Click to upload Excel file
                </p>
                <p className="text-xs text-gray-500">
                  .xlsx or .xls files only
                </p>
              </div>
            </div>
          </label>
          <div className="mt-3">
            <ExcelFormatExample />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Details
        </h3>
        <ul className="text-xs text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              You can set multiple shifts. For example, setting it to 0 allows
              flexible clock-in with no shift restrictions, but you must set a
              cross-midnight time.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              For special dates, you can configure different shift times for
              each date independently or use bulk configuration for multiple
              dates.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>Set the shift according to your actual needs.</span>
          </li>
        </ul>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={updating}
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium text-sm hover:bg-[#003152] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
