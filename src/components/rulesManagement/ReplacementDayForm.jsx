import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import image from "@/constants/image";

export const ReplacementDayForm = () => {
  const [replacementDays, setReplacementDays] = useState([
    { id: 1, date: "19/09/2025", selectedDate: null },
  ]);
  const [openPopovers, setOpenPopovers] = useState({});

  const handleDateSelect = (id, date) => {
    setReplacementDays((prev) =>
      prev.map((day) => (day.id === id ? { ...day, selectedDate: date } : day))
    );
    setOpenPopovers((prev) => ({ ...prev, [id]: false }));
  };

  const togglePopover = (id, isOpen) => {
    setOpenPopovers((prev) => ({ ...prev, [id]: isOpen }));
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                SL
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                Date
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">
                Select Date
              </th>
            </tr>
          </thead>
          <tbody>
            {replacementDays.map((day) => (
              <tr
                key={day.id}
                className="border-b border-gray-200 last:border-b-0"
              >
                <td className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                  {day.id}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200">
                  {day.date}
                </td>
                <td className="py-3 px-4">
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
                            {day.selectedDate
                              ? formatDate(day.selectedDate)
                              : "Select date"}
                          </span>
                        </div>
                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={day.selectedDate}
                        onSelect={(date) => handleDateSelect(day.id, date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        </ul>
      </div>

      {/* Save Button */}
      <button className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium">
        Save
      </button>
    </div>
  );
};
