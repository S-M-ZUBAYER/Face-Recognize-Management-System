import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TimeRangePicker } from "../../TimePicker";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ExcelFormatExample from "./ExcelFormatExample";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";
import { useEditEmployeeStore } from "@/zustand/useEditEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { parseNormalData } from "@/lib/parseNormalData";
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
  const [shiftType, setShiftType] = useState("normal");
  const [specialDates, setSpecialDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { selectedEmployee } = useEditEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();
  const { updateEmployee: storeEmployeeUpdate } = useEmployeeStore();

  const [workingTimes, setWorkingTimes] = useState([
    { id: 1, label: "Working Time 1", startTime: "08:00", endTime: "12:00" },
    { id: 2, label: "Working Time 2", startTime: "13:00", endTime: "17:00" },
  ]);

  const [overtimes, setOvertimes] = useState([
    { id: 1, label: "Overtime 1", startTime: "18:00", endTime: "20:00" },
  ]);

  const [dateConfigs, setDateConfigs] = useState({});
  const [bulkConfigDialog, setBulkConfigDialog] = useState(false);
  const [bulkWorkingTimes, setBulkWorkingTimes] = useState([
    { id: 1, label: "Working Time 1", startTime: "08:00", endTime: "12:00" },
  ]);
  const [bulkOvertimes, setBulkOvertimes] = useState([
    { id: 1, label: "Overtime 1", startTime: "18:00", endTime: "20:00" },
  ]);

  // Parse timeTables from API response with proper error handling
  const parseTimeTables = (timeTables) => {
    if (!timeTables) return [];

    try {
      if (typeof timeTables === "string") {
        const parsed = JSON.parse(timeTables);
        return Array.isArray(parsed) ? parsed : [];
      }

      if (Array.isArray(timeTables)) {
        return timeTables
          .map((item) => {
            if (!item) return null;
            if (typeof item === "string") {
              try {
                return JSON.parse(item);
              } catch (e) {
                console.error("Error parsing timeTable item:", e);
                return null;
              }
            }
            return item;
          })
          .filter(Boolean);
      }

      return [];
    } catch (error) {
      console.error("Error parsing timeTables:", error);
      return [];
    }
  };

  // Safe data access helper functions
  const getSalaryRules = () => {
    return selectedEmployee?.salaryRules || {};
  };

  const getRulesArray = () => {
    const salaryRules = getSalaryRules();
    if (!salaryRules.rules) return [];

    if (Array.isArray(salaryRules.rules)) {
      return salaryRules.rules;
    }

    if (typeof salaryRules.rules === "string") {
      try {
        return JSON.parse(salaryRules.rules) || [];
      } catch (error) {
        console.error("Error parsing rules:", error);
        return [];
      }
    }

    return [];
  };

  // Load data from selectedEmployee on component mount
  useEffect(() => {
    if (!selectedEmployee) return;

    const rules = getRulesArray();
    const ruleZero = rules.find(
      (rule) => rule && (rule.ruleId === 0 || rule.ruleId === "0"),
    );

    if (ruleZero) {
      setShiftType(ruleZero.param3 || "normal");

      // Load normal shift configuration
      if (ruleZero.param3 === "normal") {
        // Load working times
        if (ruleZero.param1) {
          try {
            const parsedParam1 =
              typeof ruleZero.param1 === "string"
                ? JSON.parse(ruleZero.param1)
                : ruleZero.param1;

            if (Array.isArray(parsedParam1) && parsedParam1.length > 0) {
              const newWorkingTimes = parsedParam1.map((time, index) => ({
                id: index + 1,
                label: `Working Time ${index + 1}`,
                startTime: time.start || "08:00",
                endTime: time.end || "12:00",
              }));
              setWorkingTimes(newWorkingTimes);
            }
          } catch (error) {
            console.error("Error parsing param1:", error);
          }
        }

        // Load overtimes
        if (ruleZero.param2) {
          try {
            const parsedParam2 =
              typeof ruleZero.param2 === "string"
                ? JSON.parse(ruleZero.param2)
                : ruleZero.param2;

            if (Array.isArray(parsedParam2) && parsedParam2.length > 0) {
              const newOvertimes = parsedParam2.map((time, index) => ({
                id: index + 1,
                label: `Overtime ${index + 1}`,
                startTime: time.start || "18:00",
                endTime: time.end || "20:00",
              }));
              setOvertimes(newOvertimes);
            }
          } catch (error) {
            console.error("Error parsing param2:", error);
          }
        }
      }

      // Load special dates and date-wise configurations
      if (ruleZero.param3 === "special") {
        const salaryRules = getSalaryRules();
        if (salaryRules.timeTables) {
          try {
            const parsedTimeTables = parseTimeTables(salaryRules.timeTables);

            if (
              Array.isArray(parsedTimeTables) &&
              parsedTimeTables.length > 0
            ) {
              const dateConfigsMap = {};
              const dates = [];

              parsedTimeTables.forEach((table) => {
                if (table && table.date) {
                  try {
                    const [year, month, day] = table.date.split("-");
                    const dateObj = new Date(
                      parseInt(year),
                      parseInt(month) - 1,
                      parseInt(day),
                    );
                    dates.push(dateObj);

                    // Parse working times for this date
                    let workingTimesForDate = [];
                    if (table.param1) {
                      const parsedParam1 =
                        typeof table.param1 === "string"
                          ? JSON.parse(table.param1)
                          : table.param1;

                      if (Array.isArray(parsedParam1)) {
                        workingTimesForDate = parsedParam1.map(
                          (time, index) => ({
                            id: index + 1,
                            label: `Working Time ${index + 1}`,
                            startTime: time?.start || "08:00",
                            endTime: time?.end || "12:00",
                          }),
                        );
                      }
                    }

                    // Parse overtime for this date
                    let overtimesForDate = [];
                    if (table.param2) {
                      const parsedParam2 =
                        typeof table.param2 === "string"
                          ? JSON.parse(table.param2)
                          : table.param2;

                      if (Array.isArray(parsedParam2)) {
                        overtimesForDate = parsedParam2.map((time, index) => ({
                          id: index + 1,
                          label: `Overtime ${index + 1}`,
                          startTime: time?.start || "18:00",
                          endTime: time?.end || "20:00",
                        }));
                      }
                    }

                    dateConfigsMap[table.date] = {
                      workingTimes: workingTimesForDate,
                      overtimes: overtimesForDate,
                    };
                  } catch (error) {
                    console.error("Error processing table:", table, error);
                  }
                }
              });

              setSpecialDates(dates);
              setDateConfigs(dateConfigsMap);

              // if (dates.length > 0) {
              //   const firstDateStr = formatDateForDisplay(dates[0]);
              //   setSelectedDates([firstDateStr]);
              // }
            }
          } catch (error) {
            console.error("Error parsing timeTables:", error);
          }
        }
      }
    }
  }, [selectedEmployee]);

  // Update current working times and overtime when selected dates change
  useEffect(() => {
    if (shiftType === "special" && selectedDates.length > 0) {
      if (selectedDates.length === 1) {
        const config = dateConfigs[selectedDates[0]];
        if (config) {
          // Make sure we're setting both workingTimes and overtimes from the config
          setWorkingTimes(config.workingTimes || []);
          setOvertimes(config.overtimes || []);
        } else {
          // Initialize with default values if no config exists
          const defaultWorkingTimes = [
            {
              id: 1,
              label: "Working Time 1",
              startTime: "08:00",
              endTime: "12:00",
            },
          ];
          const defaultOvertimes = [
            {
              id: 1,
              label: "Overtime 1",
              startTime: "18:00",
              endTime: "20:00",
            },
          ];

          setWorkingTimes(defaultWorkingTimes);
          setOvertimes(defaultOvertimes);

          // Also save these defaults to dateConfigs
          setDateConfigs((prev) => ({
            ...prev,
            [selectedDates[0]]: {
              workingTimes: defaultWorkingTimes,
              overtimes: defaultOvertimes,
            },
          }));
        }
      }
    }
  }, [selectedDates, shiftType, dateConfigs]);
  const addWorkingTime = () => {
    const newId = Math.max(0, ...workingTimes.map((w) => w.id)) + 1;
    const newWorkingTimes = [
      ...workingTimes,
      {
        id: newId,
        label: `Working Time ${newId}`,
        startTime: "09:00",
        endTime: "18:00",
      },
    ];
    setWorkingTimes(newWorkingTimes);

    // Save to dateConfigs for the selected date
    if (shiftType === "special" && selectedDates.length === 1) {
      const dateStr = selectedDates[0];
      setDateConfigs((prev) => ({
        ...prev,
        [dateStr]: {
          workingTimes: newWorkingTimes,
          overtimes: overtimes, // Use current overtimes state
        },
      }));
    }
  };
  const addOvertime = () => {
    const newId = Math.max(0, ...overtimes.map((o) => o.id)) + 1;
    const newOvertimes = [
      ...overtimes,
      {
        id: newId,
        label: `Overtime ${newId}`,
        startTime: "18:00",
        endTime: "22:00",
      },
    ];
    setOvertimes(newOvertimes);

    // Save to dateConfigs for the selected date
    if (shiftType === "special" && selectedDates.length === 1) {
      const dateStr = selectedDates[0];
      setDateConfigs((prev) => ({
        ...prev,
        [dateStr]: {
          workingTimes: workingTimes, // Use current workingTimes state
          overtimes: newOvertimes,
        },
      }));
    }
  };

  const removeWorkingTime = (id) => {
    if (workingTimes.length > 1) {
      const newWorkingTimes = workingTimes.filter((wt) => wt.id !== id);
      setWorkingTimes(newWorkingTimes);

      // Save to dateConfigs for the selected date
      if (shiftType === "special" && selectedDates.length === 1) {
        const dateStr = selectedDates[0];
        setDateConfigs((prev) => ({
          ...prev,
          [dateStr]: {
            workingTimes: newWorkingTimes,
            overtimes: overtimes, // Use current overtimes state
          },
        }));
      }
    } else {
      toast.error("At least one working time is required");
    }
  };
  const removeOvertime = (id) => {
    const newOvertimes = overtimes.filter((ot) => ot.id !== id);
    setOvertimes(newOvertimes);

    // Save to dateConfigs for the selected date
    if (shiftType === "special" && selectedDates.length === 1) {
      const dateStr = selectedDates[0];
      setDateConfigs((prev) => ({
        ...prev,
        [dateStr]: {
          workingTimes: workingTimes, // Use current workingTimes state
          overtimes: newOvertimes,
        },
      }));
    }
  };

  const updateWorkingTime = (id, field, value) => {
    const newWorkingTimes = workingTimes.map((wt) =>
      wt.id === id ? { ...wt, [field]: value } : wt,
    );
    setWorkingTimes(newWorkingTimes);

    // Save to dateConfigs for the selected date
    if (shiftType === "special" && selectedDates.length === 1) {
      const dateStr = selectedDates[0];
      setDateConfigs((prev) => ({
        ...prev,
        [dateStr]: {
          workingTimes: newWorkingTimes,
          overtimes: overtimes, // Use current overtimes state
        },
      }));
    }
  };

  const updateOvertime = (id, field, value) => {
    const newOvertimes = overtimes.map((ot) =>
      ot.id === id ? { ...ot, [field]: value } : ot,
    );
    setOvertimes(newOvertimes);

    // Save to dateConfigs for the selected date
    if (shiftType === "special" && selectedDates.length === 1) {
      const dateStr = selectedDates[0];
      setDateConfigs((prev) => ({
        ...prev,
        [dateStr]: {
          workingTimes: workingTimes, // Use current workingTimes state
          overtimes: newOvertimes,
        },
      }));
    }
  };

  // Bulk operations for multiple dates
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
        workingTimes: [...bulkWorkingTimes],
        overtimes: [...bulkOvertimes],
      };
    });

    setDateConfigs(newConfigs);

    // If only one date is selected, update the current working times
    if (selectedDates.length === 1) {
      setWorkingTimes([...bulkWorkingTimes]);
      setOvertimes([...bulkOvertimes]);
    }

    setBulkConfigDialog(false);
    toast.success(`Configuration applied to ${selectedDates.length} date(s)`);
  };

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
        !header?.includes("type") ||
        !header?.includes("start") ||
        !header?.includes("end")
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

      // If multiple dates are selected, apply to all
      if (shiftType === "special" && selectedDates.length > 0) {
        const newConfigs = { ...dateConfigs };
        selectedDates.forEach((dateStr) => {
          newConfigs[dateStr] = {
            workingTimes:
              newWorking.length > 0
                ? newWorking
                : dateConfigs[dateStr]?.workingTimes || [],
            overtimes:
              newOvertime.length > 0
                ? newOvertime
                : dateConfigs[dateStr]?.overtimes || [],
          };
        });
        setDateConfigs(newConfigs);

        if (selectedDates.length === 1) {
          if (newWorking.length > 0) setWorkingTimes(newWorking);
          if (newOvertime.length > 0) setOvertimes(newOvertime);
        }
      } else {
        if (newWorking.length > 0) setWorkingTimes(newWorking);
        if (newOvertime.length > 0) setOvertimes(newOvertime);
      }

      toast.success("Shift times imported successfully!");
    } catch (err) {
      console.error("Excel read error:", err);
      toast.error("Failed to read Excel file. Please check the format.");
    }
  };

  const removeSpecialDate = (dateToRemove) => {
    const dateStr = formatDateForDisplay(dateToRemove);
    setSpecialDates((prev) =>
      prev.filter((date) => formatDateForDisplay(date) !== dateStr),
    );

    setDateConfigs((prev) => {
      const newConfigs = { ...prev };
      delete newConfigs[dateStr];
      return newConfigs;
    });

    setSelectedDates((prev) => prev.filter((d) => d !== dateStr));

    toast.success(`Date ${dateStr} removed`);
  };

  const handleCalendarSelect = (dates) => {
    if (dates) {
      const fixedDates = dates.map((date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        return new Date(year, month, day);
      });
      setSpecialDates(fixedDates);

      // Reset selected dates when calendar selection changes
      // if (fixedDates.length > 0) {
      //   const firstDateStr = formatDateForDisplay(fixedDates[0]);
      //   setSelectedDates([firstDateStr]);
      // } else {
      //   setSelectedDates([]);
      // }
    } else {
      setSpecialDates([]);
      setSelectedDates([]);
    }
  };

  const toggleDateSelection = (dateStr) => {
    setSelectedDates((prev) => {
      if (prev.includes(dateStr)) {
        // Simply remove the date from selection
        return prev.filter((d) => d !== dateStr);
      } else {
        // When adding a new date to selection, ensure it has a config
        const newSelected = [...prev, dateStr];

        // If this is the first date being selected (going from 0 to 1), initialize its config if needed
        if (prev.length === 0) {
          const config = dateConfigs[dateStr];
          if (!config) {
            // Initialize with default values
            const defaultWorkingTimes = [
              {
                id: 1,
                label: "Working Time 1",
                startTime: "08:00",
                endTime: "12:00",
              },
            ];
            const defaultOvertimes = [
              {
                id: 1,
                label: "Overtime 1",
                startTime: "18:00",
                endTime: "20:00",
              },
            ];

            setDateConfigs((prevConfigs) => ({
              ...prevConfigs,
              [dateStr]: {
                workingTimes: defaultWorkingTimes,
                overtimes: defaultOvertimes,
              },
            }));

            setWorkingTimes(defaultWorkingTimes);
            setOvertimes(defaultOvertimes);
          }
        }

        return newSelected;
      }
    });
  };

  const selectAllDatesInMonth = () => {
    const datesInMonth = getDatesInCurrentMonth();
    setSelectedDates(datesInMonth);
  };

  const clearAllSelections = () => {
    setSelectedDates([]);
  };

  const getDatesInCurrentMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    return specialDates
      .filter((date) => {
        const d = new Date(date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(formatDateForDisplay);
  };

  const formatDateForDisplay = (date) => {
    if (!date) return "";

    if (typeof date === "string") {
      return date;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateForUI = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
    try {
      if (!selectedEmployee?.employeeId) {
        toast.error("No employee selected");
        return;
      }

      // Validation for special dates
      if (shiftType === "special") {
        if (specialDates.length === 0) {
          toast.error("Please select at least one special date!");
          return;
        }

        // Check each special date has at least one working time
        for (const date of specialDates) {
          const dateStr = formatDateForDisplay(date);
          const config = dateConfigs[dateStr];

          if (
            !config ||
            !config.workingTimes ||
            config.workingTimes.length === 0
          ) {
            toast.error(`Please add at least one working time for ${dateStr}!`);
            return;
          }
        }
      }

      // Validation for normal shift type
      if (shiftType === "normal") {
        if (workingTimes.length === 0) {
          toast.error("Please add at least one working time before saving!");
          return;
        }
      }

      const employeeId = selectedEmployee.employeeId.toString();
      const salaryRules = getSalaryRules();
      const existingRules = getRulesArray();

      const existingRuleZero = existingRules.find(
        (r) => r && (r.ruleId === 0 || r.ruleId === "0"),
      );

      const workingTimesData = JSON.stringify(
        workingTimes.map((wt) => ({ start: wt.startTime, end: wt.endTime })),
      );

      const overtimeData = JSON.stringify(
        overtimes.map((ot) => ({ start: ot.startTime, end: ot.endTime })),
      );

      const ruleZero =
        shiftType === "normal"
          ? {
              id: existingRuleZero?.id || Math.floor(10 + Math.random() * 90),
              empId: employeeId,
              ruleId: "0",
              ruleStatus: 1,
              param1: workingTimesData,
              param2: overtimeData,
              param3: "normal",
              param4: "",
              param5: "",
              param6: "",
            }
          : {
              id: existingRuleZero?.id || Math.floor(10 + Math.random() * 90),
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

      // Build timeTables with proper date-wise configs
      const timeTablesObjects = specialDates.map((date, index) => {
        const dateStr = formatDateForDisplay(date);
        const config = dateConfigs[dateStr] || {
          workingTimes: [],
          overtimes: [],
        };

        const workingTimesData = (config.workingTimes || []).map((wt) => ({
          start: wt.startTime,
          end: wt.endTime,
        }));

        const overtimeData = (config.overtimes || []).map((ot) => ({
          start: ot.startTime,
          end: ot.endTime,
        }));

        return {
          id: index + 1,
          empId: employeeId,
          ruleId: "0",
          date: dateStr,
          param1: workingTimesData,
          param2: overtimeData,
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      });

      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: employeeId,
        timeTables: timeTablesObjects,
        rules: {
          filter: (r) => r && (r.ruleId === 0 || r.ruleId === "0"),
          newValue: ruleZero,
        },
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

      toast.success("Shift rules updated successfully!");
    } catch (error) {
      console.error("❌ Error saving shift rules:", error);
      toast.error("Failed to update shift rules.");
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedEmployee) {
        toast.error("No employee selected");
        return;
      }

      const salaryRules = getSalaryRules();
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        deleteRuleId: 0,
        timeTables: [],
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
      toast.success("Shift rules deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting shift rules:", error);
      toast.error("Failed to delete shift rules.");
    }
  };

  // Get dates for current month
  const datesInCurrentMonth = getDatesInCurrentMonth();
  const hasDatesInCurrentMonth = datesInCurrentMonth.length > 0;
  // const allSelectedInMonth = datesInCurrentMonth.length > 0 &&
  //   datesInCurrentMonth.every(date => selectedDates.includes(date));

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

      {shiftType === "special" && (
        <>
          {/* Date Selection */}
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
              <Calendar
                mode="multiple"
                selected={specialDates}
                onSelect={handleCalendarSelect}
                onMonthChange={setCurrentMonth}
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

          {/* Date-wise Configuration */}
          {specialDates.length > 0 && (
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
                                        removeFn={() =>
                                          removeBulkOvertime(ot.id)
                                        }
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                      {datesInCurrentMonth.map((dateStr) => {
                        const isSelected = selectedDates.includes(dateStr);
                        const hasConfig =
                          dateConfigs[dateStr] &&
                          dateConfigs[dateStr].workingTimes?.length > 0;

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
                                  {new Date(dateStr).toLocaleString("default", {
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
                              onClick={() =>
                                removeSpecialDate(new Date(dateStr))
                              }
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                              title="Remove date"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {selectedDates.length === 1 && (
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
                                removeFn={() => removeWorkingTime(wt.id)}
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

                        {/* Overtime for Selected Date */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                            Overtime
                          </h5>
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
                                removeFn={() => removeOvertime(ot.id)}
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
                    )}

                    {selectedDates.length > 1 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-blue-700 mb-2">
                          <span className="font-semibold">
                            {selectedDates.length}
                          </span>{" "}
                          dates selected
                        </p>
                        <p className="text-xs text-blue-600">
                          Click the "Bulk Configure" button above to apply the
                          same configuration to all selected dates
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">
                      No special dates in{" "}
                      {currentMonth.toLocaleString("default", {
                        month: "long",
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Select dates from the calendar above
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Normal Shift Configuration */}
      {shiftType === "normal" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              Normal Shift Configuration
            </h3>
          </div>
          <div className="p-4 space-y-6">
            {/* Working Times */}
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
                    removeFn={() => removeWorkingTime(wt.id)}
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

            {/* Overtime */}
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
                    removeFn={() => removeOvertime(ot.id)}
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
              You can also set 1,2,3 etc. which refers to several shift groups.
              Once set, you need to configure the start and end times for each
              group.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>Set the shift according to your actual needs.</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center w-full justify-between gap-4">
        <button
          onClick={handleDelete}
          disabled={updating}
          className="w-[50%] bg-red-500 text-white py-3 rounded-lg transition-colors font-medium text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Deleting..." : "Delete"}
        </button>
        <button
          onClick={handleSave}
          disabled={updating}
          className="w-[50%] py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium text-sm hover:bg-[#003152] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default WorkShiftTimeForm;
