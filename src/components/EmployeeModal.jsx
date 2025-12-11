import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  X,
  Loader2,
  User,
  DollarSign,
  BadgeCheck,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

// Direct imports - NO LAZY LOADING
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const EmployeeModal = ({ selectedEmp, setSelectedEmp }) => {
  const [selectedStatus, setSelectedStatus] = useState(
    selectedEmp?.address?.type || "active"
  );
  const [effectiveDate, setEffectiveDate] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { updateEmployee: updateEmployeeField } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Escape key support
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !updating) {
        setSelectedEmp(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [setSelectedEmp, updating]);

  // Set effective date
  useEffect(() => {
    if (selectedEmp?.address?.r_date) {
      try {
        setEffectiveDate(new Date(selectedEmp.address.r_date));
      } catch {
        console.error("Invalid date format:", selectedEmp.address.r_date);
        setEffectiveDate(null);
      }
    }
  }, [selectedEmp?.address?.r_date]);

  // Pre-computed data
  const employeeName = useMemo(
    () => selectedEmp?.name?.split("<")[0] || "",
    [selectedEmp?.name]
  );

  const basicInfoFields = useMemo(
    () => [
      { label: "Name", value: employeeName, icon: User },
      { label: "Email", value: selectedEmp?.email, icon: User },
      {
        label: "Employee ID",
        value: selectedEmp?.companyEmployeeId,
        icon: BadgeCheck,
      },
      { label: "Department", value: selectedEmp?.department, icon: User },
      { label: "Designation", value: selectedEmp?.designation, icon: User },
      { label: "Device MAC", value: selectedEmp?.deviceMAC, icon: User },
      { label: "Shift", value: selectedEmp?.salaryInfo?.shift, icon: User },
      {
        label: "Pay Period",
        value: selectedEmp?.salaryInfo?.payPeriod,
        icon: User,
      },
    ],
    [selectedEmp, employeeName]
  );

  const salaryInfoFields = useMemo(
    () => [
      {
        label: "Salary",
        value: selectedEmp?.salaryInfo?.salary,
        icon: DollarSign,
      },
      {
        label: "Hourly Rate",
        value: selectedEmp?.salaryInfo?.overtimeSalary,
        icon: DollarSign,
      },
      { label: "Shift", value: selectedEmp?.salaryInfo?.shift, icon: User },
    ],
    [selectedEmp]
  );

  // Simple handlers
  const handleStatusChange = useCallback((newStatus) => {
    setSelectedStatus(newStatus);
    if (newStatus === "active") {
      setEffectiveDate(null);
    }
  }, []);

  const handleSaveStatusChange = useCallback(async () => {
    if (selectedStatus === "resigned" && !effectiveDate) {
      toast.error("Please select an effective date for this status change");
      return;
    }

    const payload = {
      address: JSON.stringify({
        ...selectedEmp.address,
        type: selectedStatus,
        r_date:
          effectiveDate && selectedStatus === "resigned"
            ? format(effectiveDate, "yyyy-MM-dd")
            : "",
      }),
    };

    try {
      await updateEmployee({
        mac: selectedEmp.deviceMAC || "",
        id: selectedEmp.employeeId || selectedEmp.id,
        payload,
      });

      updateEmployeeField(selectedEmp.employeeId || selectedEmp.id, {
        address: JSON.parse(payload.address),
      });

      toast.success("employee status update success");

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSelectedEmp(null);
      }, 1500);
    } catch (error) {
      console.error("Failed to update employee status:", error);
      toast.error("Failed to update employee status. Please try again.");
    }
  }, [
    selectedEmp,
    selectedStatus,
    effectiveDate,
    updateEmployee,
    updateEmployeeField,
    setSelectedEmp,
  ]);

  const getStatusButtonColor = useCallback((status) => {
    const colors = {
      active: "bg-green-50 border-green-200 text-green-700",
      notice: "bg-yellow-50 border-yellow-200 text-yellow-700",
      resigned: "bg-red-50 border-red-200 text-red-700",
    };
    return colors[status] || "bg-gray-50 border-gray-200 text-gray-700";
  }, []);

  const getStatusDescription = useCallback(() => {
    const descriptions = {
      active: "Employee is currently active and working.",
      notice: "Employee is serving notice period.",
      resigned: "Employee has resigned from the company.",
    };
    return descriptions[selectedStatus] || "";
  }, [selectedStatus]);

  if (!selectedEmp) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm ">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/3"
        onClick={() => !updating && setSelectedEmp(null)}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-lg w-full max-w-[55vw] max-h-[95vh] overflow-hidden z-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#004368] p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">Employee Details</h2>
              <p className="text-blue-100 text-sm truncate">{employeeName}</p>
            </div>
            <button
              onClick={() => !updating && setSelectedEmp(null)}
              className="p-1 hover:bg-white/20 rounded flex-shrink-0 ml-2"
              disabled={updating}
            >
              <X size={18} />
            </button>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "inline-flex px-3 py-1 rounded-full text-xs font-semibold mt-2 border",
              getStatusButtonColor(selectedStatus)
            )}
          >
            {selectedStatus?.toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Basic Info Section */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {basicInfoFields.map((field) => {
                const IconComponent = field.icon;
                return (
                  <div
                    key={field.label}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent
                        size={14}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 truncate">
                          {field.label}
                        </p>
                        <p className="text-gray-800 font-medium text-sm truncate">
                          {field.value || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salary Info Section */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Salary Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {salaryInfoFields.map((field) => {
                const IconComponent = field.icon;
                const isMoney =
                  field.label.includes("Salary") ||
                  field.label.includes("Rate");
                return (
                  <div
                    key={field.label}
                    className="bg-green-50 rounded-lg p-3 border border-green-200"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent
                        size={14}
                        className="text-green-600 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 truncate">
                          {field.label}
                        </p>
                        <p className="text-gray-800 font-medium text-sm truncate">
                          {field.value
                            ? isMoney
                              ? `${Number(field.value).toLocaleString()}`
                              : field.value
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Employment Status
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {/* Status Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  {
                    value: "active",
                    label: "Active",
                    description: "Currently working",
                  },
                  {
                    value: "notice",
                    label: "Notice Period",
                    description: "Serving notice",
                  },
                  {
                    value: "resigned",
                    label: "Resigned",
                    description: "Left company",
                  },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={updating}
                    className={cn(
                      "rounded-lg p-3 text-left transition-colors",
                      selectedStatus === status.value
                        ? getStatusButtonColor(status.value) +
                            " ring-2 ring-offset-1"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="font-medium text-gray-900 mb-1">
                      {status.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {status.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* Status Description */}
              <div className="text-sm p-3 bg-white rounded border border-gray-200 mb-4">
                <p className="text-gray-600">{getStatusDescription()}</p>
              </div>

              {/* Date Picker for Resigned Status */}
              {selectedStatus === "resigned" && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resignation Effective Date
                  </label>

                  {/* SIMPLE POPOVER WITH CALENDAR - NO LAZY LOADING */}
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !effectiveDate && "text-muted-foreground"
                        )}
                        disabled={updating}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {effectiveDate
                          ? format(effectiveDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={effectiveDate}
                        onSelect={(date) => {
                          setEffectiveDate(date);
                          setIsCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <p className="text-xs text-gray-500 mt-2">
                    Select the date when this status change becomes effective
                    (past dates allowed)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Status updated!
                </div>
              )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setSelectedEmp(null)}
                disabled={updating}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveStatusChange}
                disabled={
                  updating || (selectedStatus === "resigned" && !effectiveDate)
                }
                className="flex-1 sm:flex-none px-4 py-2 bg-[#004368] text-white rounded-lg hover:bg-[#003152] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EmployeeModal);
