import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import image from "@/constants/image";
import { Label } from "../ui/label";

export const LeaveForm = () => {
  const [selectedLeaves, setSelectedLeaves] = useState([]);
  const [openPopovers, setOpenPopovers] = useState({});
  const [leaveDetails, setLeaveDetails] = useState({});

  const handleLeaveChange = (leave, checked) => {
    if (checked) {
      setSelectedLeaves((prev) => [...prev, leave]);
      // Initialize details for the selected leave
      setLeaveDetails((prev) => ({
        ...prev,
        [leave]: {
          dates: [],
          days: "",
          cost: "",
        },
      }));
    } else {
      setSelectedLeaves((prev) => prev.filter((l) => l !== leave));
      // Remove details for the deselected leave
      setLeaveDetails((prev) => {
        const newDetails = { ...prev };
        delete newDetails[leave];
        return newDetails;
      });
      // Close popover if open
      setOpenPopovers((prev) => {
        const newPopovers = { ...prev };
        delete newPopovers[leave];
        return newPopovers;
      });
    }
  };

  const handleDateChange = (leave, newDates) => {
    setLeaveDetails((prev) => ({
      ...prev,
      [leave]: {
        ...prev[leave],
        dates: newDates || [],
      },
    }));
  };

  const removeDate = (leave, dateToRemove) => {
    setLeaveDetails((prev) => ({
      ...prev,
      [leave]: {
        ...prev[leave],
        dates: prev[leave].dates.filter(
          (date) => date.getTime() !== dateToRemove.getTime()
        ),
      },
    }));
  };

  const handleDetailChange = (leave, field, value) => {
    setLeaveDetails((prev) => ({
      ...prev,
      [leave]: {
        ...prev[leave],
        [field]: value,
      },
    }));
  };

  const togglePopover = (leave, isOpen) => {
    setOpenPopovers((prev) => ({
      ...prev,
      [leave]: isOpen,
    }));
  };

  const leaves = [
    "Maternity Leave",
    "For Marriage",
    "Paternity Leave",
    "Sick Leave",
    "Casual Leave",
    "Earned Leave",
    "Without Pay Leave",
    "Rest Leave",
    "Others",
  ];

  const requiresAdditionalDetails = (leave) =>
    leave === "Without Pay Leave" || leave === "Others";

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-3">Leave Types</label>
        <div className="space-y-4">
          {leaves.map((leave) => (
            <div key={leave} className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={selectedLeaves.includes(leave)}
                  onCheckedChange={(checked) =>
                    handleLeaveChange(leave, checked)
                  }
                  className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
                />
                <span className="text-sm font-medium min-w-[120px]">
                  {leave}
                </span>
              </label>

              {/* Date Picker for selected leaves */}
              {selectedLeaves.includes(leave) && (
                <div className="ml-7 space-y-3">
                  <div className="flex items-start gap-3">
                    <Label
                      htmlFor={`${leave}-date`}
                      className="text-sm min-w-[60px] pt-2"
                    >
                      Dates
                    </Label>
                    <div className="flex-1 space-y-2">
                      <Popover
                        open={openPopovers[leave]}
                        onOpenChange={(isOpen) => togglePopover(leave, isOpen)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={image.calendar}
                                alt="calendar"
                                className="w-4 h-4"
                              />
                              <span>
                                {leaveDetails[leave]?.dates?.length > 0
                                  ? `${leaveDetails[leave].dates.length} date(s) selected`
                                  : "Select dates"}
                              </span>
                            </div>
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="multiple"
                            selected={leaveDetails[leave]?.dates || []}
                            onSelect={(dates) => handleDateChange(leave, dates)}
                            initialFocus
                            className="p-3"
                            modifiersStyles={{
                              today: {
                                backgroundColor: "transparent",
                                color: "inherit",
                              },
                            }}
                          />
                        </PopoverContent>
                      </Popover>

                      {/* Selected dates list */}
                      {leaveDetails[leave]?.dates?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">
                            Selected dates:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {leaveDetails[leave].dates.map((date, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                              >
                                <span>{formatDate(date)}</span>
                                <button
                                  type="button"
                                  onClick={() => removeDate(leave, date)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <XIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional details for specific leave types */}
                  {requiresAdditionalDetails(leave) && (
                    <div className="ml-7 flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${leave}-days`} className="text-sm">
                          Days
                        </Label>
                        <input
                          id={`${leave}-days`}
                          type="number"
                          placeholder="Enter days"
                          value={leaveDetails[leave]?.days || ""}
                          onChange={(e) =>
                            handleDetailChange(leave, "days", e.target.value)
                          }
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${leave}-cost`} className="text-sm">
                          Cost
                        </Label>
                        <input
                          id={`${leave}-cost`}
                          type="number"
                          placeholder="Enter cost"
                          value={leaveDetails[leave]?.cost || ""}
                          onChange={(e) =>
                            handleDetailChange(leave, "cost", e.target.value)
                          }
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected leaves summary */}
      {selectedLeaves.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">
            Selected Leaves Summary:
          </h4>
          <div className="text-sm text-gray-600 space-y-3">
            {selectedLeaves.map((leave) => (
              <div key={leave} className="border-b pb-2 last:border-b-0">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{leave}</span>
                  {leaveDetails[leave]?.dates?.length > 0 ? (
                    <span className="text-gray-500">
                      {leaveDetails[leave].dates.length} date(s)
                    </span>
                  ) : (
                    <span className="text-gray-400">No dates selected</span>
                  )}
                </div>
                {leaveDetails[leave]?.dates?.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    {leaveDetails[leave].dates.map((date, idx) => (
                      <span key={idx} className="mr-2">
                        {formatDate(date)}
                        {idx < leaveDetails[leave].dates.length - 1 ? "," : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <div className="space-y-2.5">
          <p className="text-sm text-gray-500">
            you can select national or company-specific holidays (e.g,marriage
            leave),check the corresponding holiday,and select the date.The
            selected date will turn ble and be saved, allowing the employee to
            enjoy the holiday without a salary deduction.
          </p>
          <p className="text-sm text-gray-500">
            You can also set sick leave and other options, and you can set
            either a fixed deduction amount or a proportional deduction of daily
            salary.For example, if a fixed amount is checked and set to 200, the
            deduction will be 200.if a proportional amount is checked and set to
            0.5, 0.5 days of salary will be deducted. Based on company policy,
            this can also be set to 0, indicating no deduction.
          </p>
        </div>
      </div>

      <button className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium">
        Save Configuration
      </button>
    </div>
  );
};
