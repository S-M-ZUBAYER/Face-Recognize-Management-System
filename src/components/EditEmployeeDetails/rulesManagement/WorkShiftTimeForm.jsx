import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Plus, Trash2 } from "lucide-react";
import { TimeRangePicker } from "./TimePicker";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ExcelFormatExample from "./ExcelFormatExample";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";

export const WorkShiftTimeForm = () => {
  const [shiftType, setShiftType] = useState("normal");
  const [specialDates, setSpecialDates] = useState([]);
  const { selectedEmployee } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  const [workingTimes, setWorkingTimes] = useState([
    { id: 1, label: "Working Time 1", startTime: "08:00", endTime: "12:00" },
    { id: 2, label: "Working Time 2", startTime: "13:00", endTime: "17:00" },
  ]);

  const [overtimes, setOvertimes] = useState([
    { id: 1, label: "Overtime 1", startTime: "18:00", endTime: "20:00" },
  ]);

  // Load data from selectedEmployee on component mount
  useEffect(() => {
    if (selectedEmployee?.salaryRules?.rules) {
      const ruleZero = selectedEmployee.salaryRules.rules.find(
        (rule) => rule.ruleId === 0
      );

      if (ruleZero) {
        // Set shift type
        setShiftType(ruleZero.param3 || "normal");

        // Load working times and overtime for normal shift type
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

        // Load special dates for special shift type
        if (
          ruleZero.param3 === "special" &&
          selectedEmployee.salaryRules.timeTables
        ) {
          try {
            const timeTables = selectedEmployee.salaryRules.timeTables;
            if (Array.isArray(timeTables)) {
              const dates = timeTables.map((item) => item.date);
              setSpecialDates(dates.map((dateStr) => new Date(dateStr)));
            }
          } catch (error) {
            console.error("Error parsing timeTables:", error);
          }
        }
      }
    }
  }, [selectedEmployee]);

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

  // ===== Remove handlers =====
  const removeWorkingTime = (id) => {
    setWorkingTimes(workingTimes.filter((salary) => salary.id !== id));
  };

  const removeOvertime = (id) => {
    setOvertimes(overtimes.filter((salary) => salary.id !== id));
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

  // Convert Excel time (fraction of a day) to HH:mm string
  const excelTimeToString = (excelTime) => {
    if (typeof excelTime === "number") {
      const totalMinutes = Math.round(excelTime * 24 * 60);
      const hours = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
      const minutes = (totalMinutes % 60).toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return excelTime; // already string
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

      // rows like: [["Type","Start","End"],["working","09:00","12:00"], ...]
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
      alert("Failed to read Excel file. Please check the format.");
    }
  };

  // ===== Save handler =====
  // ===== Save handler =====
  const handleSave = async () => {
    try {
      // base fallback
      const existingSalaryRules = selectedEmployee?.salaryRules || {
        empId: selectedEmployee?.employeeId || 0,
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

      // parse existing rules if needed
      const parsedRules =
        typeof existingSalaryRules.rules === "string"
          ? JSON.parse(existingSalaryRules.rules)
          : existingSalaryRules.rules || [];

      // prepare ruleZero
      let ruleZero;

      if (shiftType === "normal") {
        const workingTimesData = JSON.stringify(
          workingTimes.map((wt) => ({ start: wt.startTime, end: wt.endTime }))
        ); // e.g. "[{...},{...}]"

        const overtimeData = JSON.stringify(
          overtimes.map((ot) => ({ start: ot.startTime, end: ot.endTime }))
        );

        ruleZero = {
          id: parsedRules.find((r) => r.ruleId === 0)?.id || Date.now(),
          empId: selectedEmployee?.employeeId?.toString() || "",
          ruleId: "0",
          ruleStatus: 1,
          param1: workingTimesData, // string of array
          param2: overtimeData, // string of array
          param3: "normal",
          param4: null,
          param5: null,
          param6: null,
        };

        // ensure timeTables is empty array encoded as string-of-array-of-strings
        existingSalaryRules.timeTables = JSON.stringify([]); // "[]"
      } else {
        // special
        ruleZero = {
          id: parsedRules.find((r) => r.ruleId === 0)?.id || Date.now(),
          empId: selectedEmployee?.employeeId?.toString() || "",
          ruleId: "0",
          ruleStatus: 1,
          param1: "[]",
          param2: "[]",
          param3: "special",
          param4: "",
          param5: "",
          param6: "",
        };

        // create timeTables entries - IMPORTANT: each timeTable object must be stringified, then the array of those strings must be stringified
        const timeTablesObjects = specialDates.map((date, index) => {
          const workingTimesData = JSON.stringify(
            workingTimes.map((wt) => ({ start: wt.startTime, end: wt.endTime }))
          );
          const overtimeData = JSON.stringify(
            overtimes.map((ot) => ({ start: ot.startTime, end: ot.endTime }))
          );

          return {
            id: index + 1,
            empId: selectedEmployee?.employeeId?.toString() || "",
            ruleId: "0",
            date: date.toISOString().split("T")[0],
            param1: workingTimesData, // JSON string
            param2: overtimeData, // JSON string
            param3: "",
            param4: "",
            param5: "",
            param6: "",
          };
        });

        // HERE'S THE IMPORTANT PART:
        // Make an array of stringified objects, then stringify that array.
        // Result -> "\"[\\\"{...}\\\",\\\"{...}\\\"]\""
        const timeTablesAsArrayOfStrings = timeTablesObjects.map((tt) =>
          JSON.stringify(tt)
        ); // e.g. ['{"id":1,...}', '{"id":2,...}']
        existingSalaryRules.timeTables = JSON.stringify(
          timeTablesAsArrayOfStrings
        );
        // So existingSalaryRules.timeTables becomes a string like:
        // "[\"{...}\",\"{...}\"]"
      }

      // update rules: replace ruleId===0 and keep others
      const otherRules = parsedRules.filter((rule) => rule.ruleId !== 0);
      const updatedRules = [ruleZero, ...otherRules];

      // ensure each rule in updatedRules has param1/param2 as JSON strings (we already ensured for ruleZero)
      // If other rules may have arrays, you might want to stringify their param1/param2 as well:
      const normalizedUpdatedRules = updatedRules.map((r) => {
        const copy = { ...r };
        // If param1 is array/object, stringify it; if already string leave it
        if (copy.param1 && typeof copy.param1 !== "string") {
          copy.param1 = JSON.stringify(copy.param1);
        }
        if (copy.param2 && typeof copy.param2 !== "string") {
          copy.param2 = JSON.stringify(copy.param2);
        }
        return copy;
      });

      existingSalaryRules.rules = JSON.stringify(normalizedUpdatedRules);

      // make sure all other fields are stringified arrays
      const stringFields = [
        "holidays",
        "generalDays",
        "replaceDays",
        "punchDocuments",
        "m_leaves",
        "mar_leaves",
        "p_leaves",
        "s_leaves",
        "c_leaves",
        "e_leaves",
        "w_leaves",
        "r_leaves",
        "o_leaves",
      ];

      stringFields.forEach((field) => {
        if (Array.isArray(existingSalaryRules[field])) {
          existingSalaryRules[field] = JSON.stringify(
            existingSalaryRules[field]
          );
        } else if (typeof existingSalaryRules[field] !== "string") {
          existingSalaryRules[field] = "[]";
        }
      });

      // FINAL double encoding (outer object stringified)
      const salaryRulesString = JSON.stringify(existingSalaryRules);

      const payload = { salaryRules: salaryRulesString };

      console.log(
        "Final payload (double-encoded, timeTables as array-of-strings):",
        payload
      );

      // call API
      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      toast.success("Shift rules updated successfully!");
    } catch (error) {
      console.error("Error saving shift rules:", error);
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
        <div className="mt-4 mx-[8vw]">
          <Calendar
            mode="multiple"
            selected={specialDates}
            onSelect={setSpecialDates}
            className="rounded-md border w-[18vw] "
            modifiersStyles={{
              today: {
                backgroundColor: "transparent",
                color: "inherit",
              },
            }}
          />
        </div>
      )}

      {/* Working Times */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Select work shift time</h3>
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
              className="flex items-center gap-2 text-sm text-white font-medium bg-[#004368] px-4 py-2 rounded-sm "
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
              onEndChange={(value) => updateOvertime(ot.id, "endTime", value)}
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
