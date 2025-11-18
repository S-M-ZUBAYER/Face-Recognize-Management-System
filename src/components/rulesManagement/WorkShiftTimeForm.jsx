import React, { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { Plus, Trash2, Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ExcelFormatExample from "./ExcelFormatExample";
import toast from "react-hot-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import { TimeRangePicker } from "@/components/TimePicker";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import { useUserStore } from "@/zustand/useUserStore";
import { useEmployees } from "@/hook/useEmployees";

export const WorkShiftTimeForm = () => {
  const { Employees } = useEmployees();
  const [shiftType, setShiftType] = useState("normal");
  const [specialDates, setSpecialDates] = useState([]);
  const [selectedDateForConfig, setSelectedDateForConfig] = useState(null);
  const { setRulesIds } = useUserStore();

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

  const formatDateForDisplay = (date) => {
    return date instanceof Date
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  // Get current config for selected date
  const getCurrentDateConfig = () => {
    if (!selectedDateForConfig) return null;
    const dateStr = selectedDateForConfig;
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

  // ===== Add handlers =====
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

  const addWorkingTimeToDate = () => {
    if (!selectedDateForConfig) return;
    const dateStr = selectedDateForConfig;
    const config = getCurrentDateConfig();
    const newId = Math.max(...config.workingTimes.map((w) => w.id || 0), 0) + 1;
    updateDateConfig(dateStr, {
      ...config,
      workingTimes: [
        ...config.workingTimes,
        {
          id: newId,
          label: `Working Time ${newId}`,
          startTime: "09:00",
          endTime: "18:00",
        },
      ],
    });
  };

  const addOvertimeToDate = () => {
    if (!selectedDateForConfig) return;
    const dateStr = selectedDateForConfig;
    const config = getCurrentDateConfig();
    const newId = Math.max(...config.overtimes.map((o) => o.id || 0), 0) + 1;
    updateDateConfig(dateStr, {
      ...config,
      overtimes: [
        ...config.overtimes,
        {
          id: newId,
          label: `Overtime ${newId}`,
          startTime: "18:00",
          endTime: "22:00",
        },
      ],
    });
  };

  const updateWorkingTime = (id, field, value) => {
    setWorkingTimes((prev) =>
      prev.map((wt) => (wt.id === id ? { ...wt, [field]: value } : wt))
    );
  };

  const updateOvertime = (id, field, value) => {
    setOvertimes((prev) =>
      prev.map((ot) => (ot.id === id ? { ...ot, [field]: value } : ot))
    );
  };

  const updateWorkingTimeToDate = (id, field, value) => {
    if (!selectedDateForConfig) return;
    const dateStr = selectedDateForConfig;
    const config = getCurrentDateConfig();
    updateDateConfig(dateStr, {
      ...config,
      workingTimes: config.workingTimes.map((wt) =>
        wt.id === id ? { ...wt, [field]: value } : wt
      ),
    });
  };

  const updateOvertimeToDate = (id, field, value) => {
    if (!selectedDateForConfig) return;
    const dateStr = selectedDateForConfig;
    const config = getCurrentDateConfig();
    updateDateConfig(dateStr, {
      ...config,
      overtimes: config.overtimes.map((ot) =>
        ot.id === id ? { ...ot, [field]: value } : ot
      ),
    });
  };

  const deleteWorkingTimeFromDate = (id) => {
    if (!selectedDateForConfig) return;
    const dateStr = selectedDateForConfig;
    const config = getCurrentDateConfig();
    updateDateConfig(dateStr, {
      ...config,
      workingTimes: config.workingTimes.filter((wt) => wt.id !== id),
    });
  };

  const deleteOvertimeFromDate = (id) => {
    if (!selectedDateForConfig) return;
    const dateStr = selectedDateForConfig;
    const config = getCurrentDateConfig();
    updateDateConfig(dateStr, {
      ...config,
      overtimes: config.overtimes.filter((ot) => ot.id !== id),
    });
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
    return excelTime;
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
    } else {
      setSpecialDates([]);
    }
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

      const header = rows[0]?.map((h) => h.toLowerCase());
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

      setWorkingTimes(newWorking.length ? newWorking : workingTimes);
      setOvertimes(newOvertime.length ? newOvertime : overtimes);

      toast.success("Shift times imported successfully!");
    } catch (err) {
      console.error("Excel read error:", err);
      toast.error("Failed to read Excel file. Please check the format.");
    }
  };

  // ===== Save handler =====
  const handleSave = async () => {
    try {
      if (shiftType === "normal") {
        if (workingTimes.length === 0) {
          toast.error("Please add at least one working time before saving!");
          return;
        }
        if (overtimes.length === 0) {
          toast.error("Please add at least one overtime before saving!");
          return;
        }
      }

      if (shiftType === "special") {
        if (specialDates.length === 0) {
          toast.error("Please select at least one special date!");
          return;
        }

        // Check for each selected date
        for (const date of specialDates) {
          const dateStr = date;
          const config = dateConfigs[dateStr];
          if (!config || config.workingTimes.length === 0) {
            toast.error(
              `Please add at least one working time for ${formatDateForDisplay(
                date
              )}!`
            );
            return;
          }
          if (!config || config.overtimes.length === 0) {
            toast.error(
              `Please add at least one overtime for ${formatDateForDisplay(
                date
              )}!`
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

      // ✅ Continue with saving for selected employees
      for (const emp of Employees) {
        if (!emp?.employeeId) {
          toast.error("Invalid employee data");
          continue;
        }

        const employeeId = emp.employeeId.toString();
        const salaryRules = emp.salaryRules || {};
        const existingRules = Array.isArray(salaryRules.rules)
          ? salaryRules.rules
          : JSON.parse(salaryRules.rules || "[]");

        const existingRuleZero = existingRules.find(
          (r) => r.ruleId === 0 || r.ruleId === "0"
        );

        const workingTimesData = JSON.stringify(
          workingTimes.map((wt) => ({ start: wt.startTime, end: wt.endTime }))
        );
        const overtimeData = JSON.stringify(
          overtimes.map((ot) => ({ start: ot.startTime, end: ot.endTime }))
        );

        const normalizeParam = (v) =>
          Array.isArray(v) ? JSON.stringify(v) : v ?? "";

        const ruleZero =
          shiftType === "normal"
            ? {
                id: existingRuleZero?.id || Math.floor(10 + Math.random() * 90),
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

        const timeTablesObjects = specialDates.map((date, index) => {
          const dateStr = date;
          const config = dateConfigs[dateStr] || {
            workingTimes: [],
            overtimes: [],
          };

          return {
            id: index + 1,
            empId: employeeId,
            ruleId: "0",
            date: dateStr,
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
          timeTables: timeTablesObjects,
          rules: {
            filter: (r) => r.ruleId === 0 || r.ruleId === "0",
            newValue: ruleZero,
          },
        });

        const payload = { salaryRules: JSON.stringify(updatedJSON) };

        // ✅ Use the mutation function instead of calling the hook directly
        await updateEmployee({
          mac: emp?.deviceMAC || "",
          id: employeeId,
          payload,
        });

        toast.success(`Shift configuration saved for employee ${employeeId}!`);
      }
      setRulesIds(0);
    } catch (error) {
      console.error("❌ Error saving shift rules:", error);
      toast.error("Failed to save shift configuration.");
    }
  };

  const currentDateConfig = getCurrentDateConfig();

  return (
    <div className="space-y-3">
      {/* Shift Type */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Select Type</h3>
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
            <Label htmlFor="normal">Normal</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem
              value="special"
              id="special"
              className="border-2 text-[#004368] data-[state=checked]:border-[#B0C5D0]"
            />
            <Label htmlFor="special">Special</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Special Dates Calendar */}
      {shiftType === "special" && (
        <div className="mt-4 mx-[8vw]">
          <h3 className="text-sm font-semibold mb-3">Select Special Dates</h3>
          <CalendarComponent
            mode="multiple"
            selected={specialDates.map((date) => new Date(date))}
            onSelect={handleCalendarSelect}
            className="rounded-md border w-[18vw]"
            modifiersStyles={{
              today: {
                backgroundColor: "transparent",
                color: "inherit",
              },
            }}
          />
        </div>
      )}

      {/* Date-wise Configuration for Special Type */}
      {shiftType === "special" && specialDates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Configure Shift for Selected Dates
          </h3>

          {/* Date Selector */}
          <div className="flex gap-2 flex-wrap">
            {specialDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDateForConfig(date)}
                className={`px-3 py-2 rounded-md text-sm transition-all ${
                  selectedDateForConfig && selectedDateForConfig === date
                    ? "bg-[#004368] text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-[#004368]"
                }`}
              >
                <Calendar className="w-3 h-3 inline mr-1" />
                {formatDateForDisplay(date)}
              </button>
            ))}
          </div>

          {/* Working Times for Selected Date */}
          {selectedDateForConfig && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                {currentDateConfig?.workingTimes.map((wt) => (
                  <TimeRangePicker
                    key={wt.id}
                    label={wt.label}
                    startTime={wt.startTime}
                    endTime={wt.endTime}
                    onStartChange={(value) =>
                      updateWorkingTimeToDate(wt.id, "startTime", value)
                    }
                    onEndChange={(value) =>
                      updateWorkingTimeToDate(wt.id, "endTime", value)
                    }
                    removeFn={() => deleteWorkingTimeFromDate(wt.id)}
                  />
                ))}
              </div>
              <button
                onClick={addWorkingTimeToDate}
                className="flex items-center gap-2 text-xs text-white font-medium bg-[#004368] px-3 py-1.5 rounded"
              >
                <Plus className="w-3 h-3" />
                Add Working Time
              </button>
            </div>
          )}

          {/* Overtimes for Selected Date */}
          {selectedDateForConfig && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                {currentDateConfig?.overtimes.map((ot) => (
                  <TimeRangePicker
                    key={ot.id}
                    label={ot.label}
                    startTime={ot.startTime}
                    endTime={ot.endTime}
                    onStartChange={(value) =>
                      updateOvertimeToDate(ot.id, "startTime", value)
                    }
                    onEndChange={(value) =>
                      updateOvertimeToDate(ot.id, "endTime", value)
                    }
                    removeFn={() => deleteOvertimeFromDate(ot.id)}
                  />
                ))}
              </div>
              <button
                onClick={addOvertimeToDate}
                className="flex items-center gap-2 text-xs text-white font-medium bg-[#004368] px-3 py-1.5 rounded"
              >
                <Plus className="w-3 h-3" />
                Add Overtime
              </button>
            </div>
          )}
        </div>
      )}

      {/* Normal Type - Working Times */}
      {shiftType === "normal" && (
        <>
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Select work shift time
            </h3>
            <div className="space-y-1.5">
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
                        workingTimes.filter((w) => w.id !== wt.id)
                      );
                    } else {
                      toast.error("At least one working time is required");
                    }
                  }}
                />
              ))}

              <div className="w-full flex justify-end">
                <button
                  onClick={addWorkingTime}
                  type="button"
                  className="flex items-center gap-2 text-sm text-white font-medium bg-[#004368] px-4 py-2 rounded-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Working Time
                </button>
              </div>
            </div>
          </div>

          {/* Normal Type - Overtime */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Select work Overtime</h3>
            <div className="space-y-1.5">
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

              <div className="w-full flex justify-end">
                <button
                  onClick={addOvertime}
                  type="button"
                  className="flex items-center gap-2 text-sm text-white font-medium bg-[#004368] px-8 py-2 rounded-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Overtime
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Excel Import */}
      <div>
        <h3 className="text-sm font-semibold mb-3">
          Set Time by Importing Excel
        </h3>
        <div>
          <label className="flex flex-col items-center justify-center h-20 border rounded-lg cursor-pointer transition mb-2.5">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleExcelUpload}
              className="hidden"
            />
            <div className="flex items-center gap-1.5">
              <div className="text-2xl mb-2">📤</div>
              <div>
                <p className="text-sm font-semibold">Import from Excel</p>
                <p className="text-[#9D9D9D] text-sm">
                  Upload .xlsx, .xls files
                </p>
              </div>
            </div>
          </label>
        </div>
        <ExcelFormatExample />
      </div>

      {/* Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              You can set multiple shift. For example, setting it to 0 allows
              flexible clock-in with no shift restrictions, but you must set a
              cross-midnight time.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              For special dates, you can configure different shift times for
              each date independently.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span> Set the shift according to your actual needs.</span>
          </li>
        </ul>
      </div>

      {/* Save */}
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
