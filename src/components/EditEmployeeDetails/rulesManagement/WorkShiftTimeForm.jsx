import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { TimeRangePicker } from "./TimePicker";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ExcelFormatExample from "./ExcelFormatExample";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";

export const WorkShiftTimeForm = () => {
  const [shiftType, setShiftType] = useState("normal");
  const [specialDates, setSpecialDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const { selectedEmployee } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  const [workingTimes, setWorkingTimes] = useState([
    { id: 1, label: "Working Time 1", startTime: "08:00", endTime: "12:00" },
    { id: 2, label: "Working Time 2", startTime: "13:00", endTime: "17:00" },
  ]);

  const [overtimes, setOvertimes] = useState([
    { id: 1, label: "Overtime 1", startTime: "18:00", endTime: "20:00" },
  ]);

  const [dateConfigs, setDateConfigs] = useState({});

  // Parse timeTables from API response
  const parseTimeTables = (timeTables) => {
    if (!timeTables) return [];

    if (typeof timeTables === "string") {
      try {
        return JSON.parse(timeTables);
      } catch (e) {
        console.error("Error parsing timeTables string:", e);
        return [];
      }
    }

    if (Array.isArray(timeTables)) {
      return timeTables
        .map((item) => {
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
  };

  // Load data from selectedEmployee on component mount
  useEffect(() => {
    if (selectedEmployee?.salaryRules?.rules) {
      const ruleZero = selectedEmployee.salaryRules.rules.find(
        (rule) => rule.ruleId === 0 || rule.ruleId === "0"
      );

      if (ruleZero) {
        setShiftType(ruleZero.param3 || "normal");

        if (ruleZero.param3 === "normal" && ruleZero.param1) {
          try {
            const parsedParam1 =
              typeof ruleZero.param1 === "string"
                ? JSON.parse(ruleZero.param1)
                : ruleZero.param1;

            if (Array.isArray(parsedParam1)) {
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

        if (ruleZero.param3 === "normal" && ruleZero.param2) {
          try {
            const parsedParam2 =
              typeof ruleZero.param2 === "string"
                ? JSON.parse(ruleZero.param2)
                : ruleZero.param2;

            if (Array.isArray(parsedParam2)) {
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

        // Load special dates and date-wise configurations
        if (
          ruleZero.param3 === "special" &&
          selectedEmployee.salaryRules.timeTables
        ) {
          try {
            const parsedTimeTables = parseTimeTables(
              selectedEmployee.salaryRules.timeTables
            );

            if (
              Array.isArray(parsedTimeTables) &&
              parsedTimeTables.length > 0
            ) {
              const dateConfigsMap = {};
              const dates = [];

              parsedTimeTables.forEach((table) => {
                if (table.date) {
                  const [year, month, day] = table.date.split("-");
                  const dateObj = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                  );
                  dates.push(dateObj);

                  // Parse working times for this date
                  let workingTimesForDate = [];
                  if (table.param1) {
                    try {
                      const parsedParam1 =
                        typeof table.param1 === "string"
                          ? JSON.parse(table.param1)
                          : table.param1;

                      if (Array.isArray(parsedParam1)) {
                        workingTimesForDate = parsedParam1.map(
                          (time, index) => ({
                            id: index + 1,
                            label: `Working Time ${index + 1}`,
                            startTime: time.start || "08:00",
                            endTime: time.end || "12:00",
                          })
                        );
                      }
                    } catch (error) {
                      console.error("Error parsing date param1:", error);
                    }
                  }

                  // Parse overtime for this date
                  let overtimesForDate = [];
                  if (table.param2) {
                    try {
                      const parsedParam2 =
                        typeof table.param2 === "string"
                          ? JSON.parse(table.param2)
                          : table.param2;

                      if (Array.isArray(parsedParam2)) {
                        overtimesForDate = parsedParam2.map((time, index) => ({
                          id: index + 1,
                          label: `Overtime ${index + 1}`,
                          startTime: time.start || "18:00",
                          endTime: time.end || "20:00",
                        }));
                      }
                    } catch (error) {
                      console.error("Error parsing date param2:", error);
                    }
                  }

                  dateConfigsMap[table.date] = {
                    workingTimes: workingTimesForDate,
                    overtimes: overtimesForDate,
                  };
                }
              });

              setSpecialDates(dates);
              setDateConfigs(dateConfigsMap);

              if (dates.length > 0) {
                const firstDateStr = formatDateForDisplay(dates[0]);
                setSelectedDate(firstDateStr);
              }
            }
          } catch (error) {
            console.error("Error parsing timeTables:", error);
          }
        }
      }
    }
  }, [selectedEmployee]);

  // Update current working times and overtime when selected date changes
  useEffect(() => {
    if (shiftType === "special" && selectedDate && dateConfigs[selectedDate]) {
      setWorkingTimes(dateConfigs[selectedDate].workingTimes);
      setOvertimes(dateConfigs[selectedDate].overtimes);
    }
  }, [selectedDate, shiftType, dateConfigs]);

  // Save current configuration for the selected date
  const saveDateConfig = () => {
    if (shiftType === "special" && selectedDate) {
      setDateConfigs((prev) => ({
        ...prev,
        [selectedDate]: {
          workingTimes: [...workingTimes],
          overtimes: [...overtimes],
        },
      }));

      toast.success(`Configuration saved for ${selectedDate}`);
    }
  };

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

  const removeWorkingTime = (id) => {
    if (workingTimes.length > 1) {
      setWorkingTimes(workingTimes.filter((wt) => wt.id !== id));
    } else {
      toast.error("At least one working time is required");
    }
  };

  const removeOvertime = (id) => {
    setOvertimes(overtimes.filter((ot) => ot.id !== id));
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

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const header = rows[0]?.map((h) => h?.toString().toLowerCase());
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

      if (newWorking.length > 0) {
        setWorkingTimes(newWorking);
      }
      if (newOvertime.length > 0) {
        setOvertimes(newOvertime);
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
      prev.filter((date) => formatDateForDisplay(date) !== dateStr)
    );

    setDateConfigs((prev) => {
      const newConfigs = { ...prev };
      delete newConfigs[dateStr];
      return newConfigs;
    });

    if (selectedDate === dateStr) {
      setSelectedDate(null);
    }

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
    } else {
      setSpecialDates([]);
    }
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

  const handleSave = async () => {
    try {
      if (!selectedEmployee?.employeeId) {
        toast.error("No employee selected");
        return;
      }

      const employeeId = selectedEmployee.employeeId.toString();
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];

      const existingRuleZero = existingRules.find(
        (r) => r.ruleId === 0 || r.ruleId === "0"
      );

      const workingTimesData = JSON.stringify(
        workingTimes.map((wt) => ({ start: wt.startTime, end: wt.endTime }))
      );

      const overtimeData = JSON.stringify(
        overtimes.map((ot) => ({ start: ot.startTime, end: ot.endTime }))
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

        const workingTimesData = JSON.stringify(
          config.workingTimes.map((wt) => ({
            start: wt.startTime,
            end: wt.endTime,
          }))
        );

        const overtimeData = JSON.stringify(
          config.overtimes.map((ot) => ({
            start: ot.startTime,
            end: ot.endTime,
          }))
        );

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
          filter: (r) => r.ruleId === 0 || r.ruleId === "0",
          newValue: ruleZero,
        },
      });

      console.log("🧩 Final Generated JSON:", updatedJSON);

      const payload = { salaryRules: JSON.stringify(updatedJSON) };

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      toast.success("Shift rules updated successfully!");
    } catch (error) {
      console.error("❌ Error saving shift rules:", error);
      toast.error("Failed to update shift rules.");
    }
  };

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

      {shiftType === "special" && (
        <>
          {/* Date Selection */}
          <div className="mt-4 mx-[8vw]">
            <Calendar
              mode="multiple"
              selected={specialDates}
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

          {/* Date-wise Configuration */}
          {specialDates.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-3">Configure Dates</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {specialDates.map((date) => {
                  const dateStr = formatDateForDisplay(date);
                  const isSelected = selectedDate === dateStr;
                  return (
                    <div key={dateStr} className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                          isSelected
                            ? "bg-[#004368] text-white border-[#004368]"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <CalendarIcon className="w-4 h-4" />
                        {dateStr}
                      </button>
                      <button
                        onClick={() => removeSpecialDate(date)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                        title="Remove date"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      Configuration for {selectedDate}
                    </h4>
                    <button
                      onClick={saveDateConfig}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      Save for this Date
                    </button>
                  </div>

                  {/* Working Times for Selected Date */}
                  <div>
                    <h5 className="text-sm font-medium mb-2">Working Times</h5>
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
                          removeFn={() => removeWorkingTime(wt.id)}
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

                  {/* Overtime for Selected Date */}
                  <div>
                    <h5 className="text-sm font-medium mb-2">Overtime</h5>
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
                          removeFn={() => removeOvertime(ot.id)}
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
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Normal Shift Configuration */}
      {shiftType === "normal" && (
        <>
          {/* Working Times */}
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
                  removeFn={() => removeWorkingTime(wt.id)}
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

          {/* Overtime */}
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
                  removeFn={() => removeOvertime(ot.id)}
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
              You can set multiple shift.For example,setting it to 0 allows
              flexible clock-in with no shift restrictions,but you must set a
              cross-midnight time.Once set,the system will treat time after that
              point as a new day.Clock-in records will automatically wrap to the
              next line. For example,if the default new day starts at 00:00 and
              you set it to 05:00,then clock-ins after 5 AM will be treated as a
              new day and shown on the next line.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              You can also set 1,2,3 etc.Which refers to several shift
              groups.Once set, you need to configure the start and end times for
              each group.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span> So set the shift according to your actual needs.</span>
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

export default WorkShiftTimeForm;
