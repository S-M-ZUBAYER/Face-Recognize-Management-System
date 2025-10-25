import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// ============================================
// TIME PICKER COMPONENT
// ============================================

export const TimePicker = ({ value, onChange, onClose }) => {
  const [hours, setHours] = useState("08");
  const [minutes, setMinutes] = useState("00");

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHours(h);
      setMinutes(m);
    }
  }, [value]);

  const handleApply = () => {
    onChange(`${hours}:${minutes}`);
    onClose();
  };

  const generateOptions = (max) => {
    return Array.from({ length: max }, (_, i) => i.toString().padStart(2, "0"));
  };

  return (
    <div className="bg-white rounded-lg p-4 w-64">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold">Select Time</h3>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <select
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {generateOptions(24).map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-2xl font-bold">:</span>
        <select
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {generateOptions(60).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

// ============================================
// TIME RANGE PICKER WITH SHADCN POPOVER
// ============================================

export const TimeRangePicker = ({
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  label,
  removeFn,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>

      <div className="flex items-center gap-2">
        {/* Start Time Picker */}
        <Popover
          open={showStartPicker}
          onOpenChange={(v) => setShowStartPicker(v)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[100px]"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{startTime}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 z-50"
            align="start"
            side="bottom"
          >
            <TimePicker
              value={startTime}
              onChange={onStartChange}
              onClose={() => setShowStartPicker(false)}
            />
          </PopoverContent>
        </Popover>

        <span className="text-gray-400">-</span>

        {/* End Time Picker */}
        <Popover open={showEndPicker} onOpenChange={(v) => setShowEndPicker(v)}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[100px]"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{endTime}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="end" side="bottom">
            <TimePicker
              value={endTime}
              onChange={onEndChange}
              onClose={() => setShowEndPicker(false)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <button
        type="button"
        onClick={removeFn}
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
