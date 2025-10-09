import React, { useState } from "react";
import { Plus } from "lucide-react";
import RuleHeader from "./RuleHeader";
import { TimeRangePicker } from "./TimePicker";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const WorkShiftTimeForm = ({ onBack }) => {
  const [shiftType, setShiftType] = useState("normal");

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

  // ===== Save handler =====
  const handleSave = () => {
    const formData = {
      shiftType,
      workingTimes,
      overtimes,
    };
    console.log("Saved Shift:", formData);
    // You can pass this to an API or parent component
  };

  return (
    <div className="space-y-6">
      <RuleHeader title="Select Work Shift Time" onBack={onBack} />

      {/* Shift Type */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Select Type</h3>
        <RadioGroup
          value={shiftType}
          onValueChange={setShiftType}
          className="flex gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="normal" id="normal" />
            <Label htmlFor="normal">Normal</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="special" id="special" />
            <Label htmlFor="special">Special</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Working Times */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Working Time</h3>
        <div className="space-y-3">
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

          <button
            onClick={addWorkingTime}
            type="button"
            className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Working Time
          </button>
        </div>
      </div>

      {/* Overtime */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Overtime</h3>
        <div className="space-y-3">
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

          <button
            onClick={addOvertime}
            type="button"
            className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Overtime
          </button>
        </div>
      </div>

      {/* Details Section */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <p className="text-sm text-gray-500">
          Define the details of your pay period and time shift structure.
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium"
      >
        Save
      </button>
    </div>
  );
};
