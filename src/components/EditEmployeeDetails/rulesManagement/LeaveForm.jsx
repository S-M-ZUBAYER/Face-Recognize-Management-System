import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDownIcon, XIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import image from "@/constants/image";
import { Label } from "@/components/ui/label";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import finalJsonForUpdate from "@/lib/finalJsonForUpdate";
import formatDateForStorage from "@/lib/formatDateForStorage";

export const LeaveForm = () => {
  const [selectedLeaves, setSelectedLeaves] = useState([]);
  const [openPopovers, setOpenPopovers] = useState({});
  const [leaveDetails, setLeaveDetails] = useState({});
  const [timePopovers, setTimePopovers] = useState({});
  const [tempTimeRanges, setTempTimeRanges] = useState({});
  const [totalLeaveDays, setTotalLeaveDays] = useState(0);
  const { selectedEmployee } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Helper function to get consistent date string
  const getDateString = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Leave type mappings
  const leaveMappings = {
    "Maternity Leave": "m_leaves",
    "For Marriage": "mar_leaves",
    "Paternity Leave": "p_leaves",
    "Sick Leave": "s_leaves",
    "Casual Leave": "c_leaves",
    "Earned Leave": "e_leaves",
    "Without Pay Leave": "w_leaves",
    "Rest Leave": "r_leaves",
    Others: "o_leaves",
  };

  const ruleTenMappings = {
    "Sick Leave": 4,
    "Without Pay Leave": 7,
    Others: 9,
  };

  // Load existing leave data
  useEffect(() => {
    if (selectedEmployee?.salaryRules) {
      const salaryRules = selectedEmployee.salaryRules;

      // Load total leave days from ruleId === 24
      try {
        const rules =
          typeof salaryRules.rules === "string"
            ? JSON.parse(salaryRules.rules)
            : salaryRules.rules || [];

        const ruleTwentyFour = rules.find(
          (rule) => rule.ruleId === 24 || rule.ruleId === "24"
        );
        if (ruleTwentyFour && ruleTwentyFour.param1) {
          const totalDays =
            typeof ruleTwentyFour.param1 === "string"
              ? parseInt(ruleTwentyFour.param1)
              : ruleTwentyFour.param1;
          setTotalLeaveDays(totalDays || 0);
        }
      } catch (error) {
        console.error("Error parsing total leave days:", error);
      }

      // Load selected leaves and their details
      const loadedSelectedLeaves = [];
      const loadedLeaveDetails = {};

      Object.entries(leaveMappings).forEach(([leaveName, fieldName]) => {
        try {
          const leaveData =
            typeof salaryRules[fieldName] === "string"
              ? JSON.parse(salaryRules[fieldName])
              : salaryRules[fieldName] || [];

          if (Array.isArray(leaveData) && leaveData.length > 0) {
            loadedSelectedLeaves.push(leaveName);

            // Convert stored dates to Date objects and extract time ranges
            const dates = [];
            const timeRanges = {};

            leaveData.forEach((item) => {
              if (
                item.date &&
                typeof item.date === "object" &&
                item.date.date
              ) {
                const date = new Date(item.date.date);
                if (!isNaN(date.getTime())) {
                  dates.push(date);
                  const dateStr = getDateString(date);
                  timeRanges[dateStr] = {
                    startTime: item.date.start || null,
                    endTime: item.date.end || null,
                  };
                }
              }
            });

            loadedLeaveDetails[leaveName] = {
              dates: dates,
              days: "",
              cost: "",
              timeRanges: timeRanges,
            };
          }
        } catch (error) {
          console.error(`Error parsing ${fieldName}:`, error);
        }
      });

      // Load ruleId === 10 data for specific leaves
      try {
        const rules =
          typeof salaryRules.rules === "string"
            ? JSON.parse(salaryRules.rules)
            : salaryRules.rules || [];

        const ruleTen = rules.find(
          (rule) => rule.ruleId === 10 || rule.ruleId === "10"
        );

        if (ruleTen && ruleTen.param1) {
          const param1Data =
            typeof ruleTen.param1 === "string"
              ? JSON.parse(ruleTen.param1)
              : ruleTen.param1;

          if (Array.isArray(param1Data)) {
            param1Data.forEach((item, index) => {
              const leaveType = Object.keys(ruleTenMappings).find(
                (key) => ruleTenMappings[key] === index + 1
              );

              if (leaveType && loadedLeaveDetails[leaveType]) {
                loadedLeaveDetails[leaveType] = {
                  ...loadedLeaveDetails[leaveType],
                  days: item?.dayCount?.toString() || "",
                  cost: item?.cost?.toString() || "",
                };
              }
            });
          }
        }
      } catch (error) {
        console.error("Error parsing ruleId 10:", error);
      }

      setSelectedLeaves(loadedSelectedLeaves);
      setLeaveDetails(loadedLeaveDetails);
    }
  }, [selectedEmployee]);

  // Calculate total leave time used
  const calculateTotalLeaveTimeUsed = () => {
    let totalMinutes = 0;

    Object.values(leaveDetails).forEach((leave) => {
      if (leave.timeRanges && typeof leave.timeRanges === "object") {
        Object.values(leave.timeRanges).forEach((timeRange) => {
          // Only calculate if both start and end times are provided
          if (timeRange && timeRange.startTime && timeRange.endTime) {
            try {
              const [startHours, startMinutes] = timeRange.startTime
                .split(":")
                .map(Number);
              const [endHours, endMinutes] = timeRange.endTime
                .split(":")
                .map(Number);

              const startTotal = startHours * 60 + startMinutes;
              const endTotal = endHours * 60 + endMinutes;

              totalMinutes += Math.max(0, endTotal - startTotal);
            } catch (error) {
              console.error("Error calculating time range:", error);
            }
          }
        });
      }
    });

    const days = Math.floor(totalMinutes / (8 * 60)); // 8 hours per day
    const remainingMinutes = totalMinutes % (8 * 60);
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    return { days, hours, minutes, totalMinutes };
  };

  // Calculate remaining leave
  const calculateRemainingLeave = () => {
    const used = calculateTotalLeaveTimeUsed();
    const totalMinutesAvailable = totalLeaveDays * 8 * 60; // Convert days to minutes

    const remainingMinutes = Math.max(
      0,
      totalMinutesAvailable - used.totalMinutes
    );

    const days = Math.floor(remainingMinutes / (8 * 60));
    const remainingAfterDays = remainingMinutes % (8 * 60);
    const hours = Math.floor(remainingAfterDays / 60);
    const minutes = remainingAfterDays % 60;

    return {
      days,
      hours,
      minutes,
      totalMinutes: remainingMinutes,
      usedDays: used.days,
      usedHours: used.hours,
      usedMinutes: used.minutes,
    };
  };

  const remainingLeave = calculateRemainingLeave();

  const handleLeaveChange = (leave, checked) => {
    if (checked) {
      setSelectedLeaves((prev) => [...prev, leave]);
      setLeaveDetails((prev) => ({
        ...prev,
        [leave]: {
          dates: [],
          days: "",
          cost: "",
          timeRanges: {},
        },
      }));
    } else {
      setSelectedLeaves((prev) => prev.filter((l) => l !== leave));
      setLeaveDetails((prev) => {
        const newDetails = { ...prev };
        delete newDetails[leave];
        return newDetails;
      });
      setOpenPopovers((prev) => {
        const newPopovers = { ...prev };
        delete newPopovers[leave];
        return newPopovers;
      });
    }
  };

  const handleDateChange = (leave, newDates) => {
    if (!newDates) return;

    // Initialize time ranges for new dates with consistent date strings
    const currentTimeRanges = leaveDetails[leave]?.timeRanges || {};
    const newTimeRanges = { ...currentTimeRanges };

    newDates.forEach((date) => {
      const dateStr = getDateString(date);
      if (!newTimeRanges[dateStr]) {
        newTimeRanges[dateStr] = {
          startTime: null,
          endTime: null,
        };
      }
    });

    console.log("Updated time ranges for dates:", newDates);
    console.log("New time ranges:", newTimeRanges);

    setLeaveDetails((prev) => ({
      ...prev,
      [leave]: {
        ...prev[leave],
        dates: newDates,
        timeRanges: newTimeRanges,
      },
    }));
    togglePopover(leave, false);
  };

  const removeDate = (leave, dateToRemove) => {
    const dateStr = getDateString(dateToRemove);
    setLeaveDetails((prev) => ({
      ...prev,
      [leave]: {
        ...prev[leave],
        dates: prev[leave].dates.filter(
          (date) => getDateString(date) !== dateStr
        ),
        timeRanges: Object.keys(prev[leave].timeRanges || {})
          .filter((key) => key !== dateStr)
          .reduce((obj, key) => {
            obj[key] = prev[leave].timeRanges[key];
            return obj;
          }, {}),
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

  // Handle time change in temporary state
  const handleTempTimeChange = (leave, date, field, value) => {
    const key = `${leave}-${getDateString(date)}`;
    setTempTimeRanges((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // Apply time changes
  const applyTimeChanges = (leave, date) => {
    const key = `${leave}-${getDateString(date)}`;
    const tempTimeRange = tempTimeRanges[key];

    if (tempTimeRange) {
      setLeaveDetails((prev) => ({
        ...prev,
        [leave]: {
          ...prev[leave],
          timeRanges: {
            ...prev[leave].timeRanges,
            [getDateString(date)]: {
              startTime: tempTimeRange.startTime || null,
              endTime: tempTimeRange.endTime || null,
            },
          },
        },
      }));
    }

    // Close popover and clear temp state
    toggleTimePopover(leave, date, false);
    setTempTimeRanges((prev) => {
      const newTemp = { ...prev };
      delete newTemp[key];
      return newTemp;
    });
  };

  // Clear time for a specific date
  const clearTime = (leave, date) => {
    const dateStr = getDateString(date);
    setLeaveDetails((prev) => ({
      ...prev,
      [leave]: {
        ...prev[leave],
        timeRanges: {
          ...prev[leave].timeRanges,
          [dateStr]: {
            startTime: null,
            endTime: null,
          },
        },
      },
    }));
    toggleTimePopover(leave, date, false);
  };

  const togglePopover = (leave, isOpen) => {
    setOpenPopovers((prev) => ({
      ...prev,
      [leave]: isOpen,
    }));
  };

  const toggleTimePopover = (leave, date, isOpen) => {
    const key = `${leave}-${getDateString(date)}`;

    if (isOpen) {
      // Initialize temp state with current values when opening
      const currentTimeRange = leaveDetails[leave]?.timeRanges?.[
        getDateString(date)
      ] || {
        startTime: null,
        endTime: null,
      };
      setTempTimeRanges((prev) => ({
        ...prev,
        [key]: { ...currentTimeRange },
      }));
    }

    setTimePopovers((prev) => ({
      ...prev,
      [key]: isOpen,
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
    leave === "Sick Leave" ||
    leave === "Without Pay Leave" ||
    leave === "Others";

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time display
  const formatTimeDisplay = (timeRange) => {
    if (!timeRange.startTime && !timeRange.endTime) {
      return "Set time";
    }
    return `${timeRange.startTime || "--:--"} - ${
      timeRange.endTime || "--:--"
    }`;
  };

  // Save leave configuration
  const handleSave = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    try {
      const salaryRules = selectedEmployee.salaryRules;
      const existingRules = salaryRules.rules || [];
      const empId = selectedEmployee.employeeId.toString();

      // Prepare leave arrays for each type
      const updatedLeaveData = {};

      Object.entries(leaveMappings).forEach(([leaveName, fieldName]) => {
        if (selectedLeaves.includes(leaveName) && leaveDetails[leaveName]) {
          const leaveData = leaveDetails[leaveName].dates.map((date, index) => {
            const dateStr = getDateString(date);
            const timeRange = leaveDetails[leaveName].timeRanges?.[dateStr] || {
              startTime: null,
              endTime: null,
            };

            console.log(
              `Creating object for ${leaveName}, date ${dateStr}:`,
              timeRange
            );

            const correctDateStr = formatDateForStorage(date);

            // Base object for all leave types
            const baseLeaveObject = {
              id: index + 1,
              empId: Number(empId),
              date: JSON.stringify({
                date: `${correctDateStr}T00:00:00.000`,
                start: timeRange.startTime,
                end: timeRange.endTime,
              }),
            };

            console.log("Base leave object:", baseLeaveObject);

            // For Maternity Leave, For Marriage, Paternity Leave - no deduct fields
            if (
              leaveName === "Maternity Leave" ||
              leaveName === "For Marriage" ||
              leaveName === "Paternity Leave"
            ) {
              return baseLeaveObject;
            }

            return {
              ...baseLeaveObject,
              deductDay: "0",
              deductMoney: "0",
            };
          });
          updatedLeaveData[fieldName] = leaveData;
        } else {
          updatedLeaveData[fieldName] = [];
        }
      });

      console.log("Final updated leave data:", updatedLeaveData);

      // Prepare ruleId === 10 data
      const ruleTenData = Array(9)
        .fill(null)
        .map(() => ({ dayCount: "", cost: "" }));

      Object.entries(ruleTenMappings).forEach(([leaveName, index]) => {
        if (selectedLeaves.includes(leaveName) && leaveDetails[leaveName]) {
          ruleTenData[index - 1] = {
            dayCount: leaveDetails[leaveName].days || "",
            cost: leaveDetails[leaveName].cost || "",
          };
        }
      });

      // Find or create rule with ruleId = 10
      let ruleTen = existingRules.find(
        (rule) => rule.ruleId === 10 || rule.ruleId === "10"
      );

      if (!ruleTen) {
        ruleTen = {
          id: Math.floor(10 + Math.random() * 90),
          empId: empId,
          ruleId: "10",
          ruleStatus: 1,
          param1: JSON.stringify(ruleTenData),
          param2: "",
          param3: "",
          param4: "",
          param5: "",
          param6: "",
        };
      } else {
        ruleTen.empId = empId;
        ruleTen.param1 = JSON.stringify(ruleTenData);
      }

      // Generate final JSON
      const updatedJSON = finalJsonForUpdate(salaryRules, {
        empId: empId,
        rules: {
          filter: (r) => r.ruleId === 10 || r.ruleId === "10",
          newValue: ruleTen,
        },
        ...updatedLeaveData,
      });

      const payload = { salaryRules: JSON.stringify(updatedJSON) };
      console.log("Saving payload:", payload);

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload,
      });

      toast.success("Leave configuration updated successfully!");
    } catch (error) {
      console.error("Error saving leave configuration:", error);
      toast.error("Failed to update leave configuration.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Total Leave Display */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-green-900 mb-2">
          Leave Balance
        </h3>
        <div className="flex justify-between items-center gap-4 text-sm">
          <div>
            <div className="text-green-700 font-semibold">Total Available</div>
            <div className="text-green-600">{totalLeaveDays} Days</div>
          </div>
          <div>
            <div className="text-blue-700 font-semibold">Used</div>
            <div className="text-blue-600">
              {remainingLeave.usedDays}d {remainingLeave.usedHours}h{" "}
              {remainingLeave.usedMinutes}m
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-gray-700 font-semibold pt-2">
              Remaining Balance
            </div>
            <div className="text-gray-600">
              {remainingLeave.days} Days {remainingLeave.hours} Hours{" "}
              {remainingLeave.minutes} Minutes
            </div>
          </div>
        </div>
      </div>

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

              {selectedLeaves.includes(leave) && (
                <div className="ml-7 space-y-3">
                  <div className="flex items-start gap-3">
                    <Label className="text-sm min-w-[60px] pt-2">Dates</Label>
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

                      {leaveDetails[leave]?.dates?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">
                            Selected dates:
                          </p>
                          <div className="space-y-2">
                            {leaveDetails[leave].dates.map((date, index) => {
                              const dateStr = getDateString(date);
                              const timeRange = leaveDetails[leave]
                                .timeRanges?.[dateStr] || {
                                startTime: null,
                                endTime: null,
                              };
                              const tempKey = `${leave}-${dateStr}`;
                              const tempTimeRange =
                                tempTimeRanges[tempKey] || timeRange;

                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded"
                                >
                                  <span className="flex-1 text-sm">
                                    {formatDate(date)}
                                  </span>
                                  <Popover
                                    open={timePopovers[tempKey]}
                                    onOpenChange={(isOpen) =>
                                      toggleTimePopover(leave, date, isOpen)
                                    }
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                      >
                                        <Clock className="h-3 w-3 mr-1" />
                                        {formatTimeDisplay(timeRange)}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-3">
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <Label className="text-xs w-16">
                                            Start
                                          </Label>
                                          <input
                                            type="time"
                                            value={
                                              tempTimeRange.startTime || ""
                                            }
                                            onChange={(e) =>
                                              handleTempTimeChange(
                                                leave,
                                                date,
                                                "startTime",
                                                e.target.value
                                              )
                                            }
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Label className="text-xs w-16">
                                            End
                                          </Label>
                                          <input
                                            type="time"
                                            value={tempTimeRange.endTime || ""}
                                            onChange={(e) =>
                                              handleTempTimeChange(
                                                leave,
                                                date,
                                                "endTime",
                                                e.target.value
                                              )
                                            }
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              clearTime(leave, date)
                                            }
                                            variant="outline"
                                            className="flex-1 text-xs"
                                          >
                                            Clear
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              applyTimeChanges(leave, date)
                                            }
                                            className="flex-1 text-xs bg-[#004368] text-white"
                                          >
                                            Apply
                                          </Button>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  <button
                                    type="button"
                                    onClick={() => removeDate(leave, date)}
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

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
                    {leaveDetails[leave].dates.map((date, idx) => {
                      const dateStr = getDateString(date);
                      const timeRange = leaveDetails[leave].timeRanges?.[
                        dateStr
                      ] || {
                        startTime: null,
                        endTime: null,
                      };
                      return (
                        <span key={idx} className="block">
                          {formatDate(date)}{" "}
                          {timeRange.startTime && timeRange.endTime
                            ? `(${timeRange.startTime} - ${timeRange.endTime})`
                            : "(No time set)"}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              You can select national or company-specific holidays (e.g,marriage
              leave),check the corresponding holiday,and select the date.The
              selected date will turn ble and be saved, allowing the employee to
              enjoy the holiday without a salary deduction.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              You can also set sick leave and other options, and you can set
              either a fixed deduction amount or a proportional deduction of
              daily salary.For example, if a fixed amount is checked and set to
              200, the deduction will be 200.if a proportional amount is checked
              and set to 0.5, 0.5 days of salary will be deducted. Based on
              company policy, this can also be set to 0, indicating no
              deduction.
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        disabled={updating}
        className="w-full py-3 bg-[#004368] text-white rounded-lg hover:bg-[#003256] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updating ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  );
};
