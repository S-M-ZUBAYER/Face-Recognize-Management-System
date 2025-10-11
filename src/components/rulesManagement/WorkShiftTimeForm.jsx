import React, { useState } from "react";
import * as XLSX from "xlsx"; // 👈 import XLSX here
import { Plus } from "lucide-react";
import { TimeRangePicker } from "./TimePicker";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ExcelFormatExample from "./ExcelFormatExample";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export const WorkShiftTimeForm = () => {
  const [shiftType, setShiftType] = useState("normal");
  const [specialDates, setSpecialDates] = useState([]);

  const [workingTimes, setWorkingTimes] = useState([
    { id: 1, label: "Working Time 1", startTime: "08:00", endTime: "12:00" },
    { id: 2, label: "Working Time 2", startTime: "13:00", endTime: "17:00" },
  ]);

  const [overtimes, setOvertimes] = useState([
    { id: 1, label: "Overtime 1", startTime: "18:00", endTime: "20:00" },
  ]);

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
  const handleSave = () => {
    const formData = {
      shiftType,
      workingTimes,
      overtimes,
    };
    console.log("Saved Shift:", formData);
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
              onChange={handleExcelUpload} // 👈 added here
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
      <div>
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <p className="text-sm text-gray-500">
          Define the details of your pay period and time shift structure.
        </p>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium"
      >
        Save
      </button>
    </div>
  );
};
