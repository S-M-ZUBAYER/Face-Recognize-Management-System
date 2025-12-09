import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "./ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Loader2,
  X,
  User,
  DollarSign,
  BadgeCheck,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

const EmployeeModal = ({ selectedEmp, setSelectedEmp }) => {
  const [selectedStatus, setSelectedStatus] = useState(
    selectedEmp?.address?.type || "active"
  );
  const [effectiveDate, setEffectiveDate] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { updateEmployee: updateEmployeeField } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Memoize expensive calculations
  const basicInfoFields = useMemo(
    () => [
      { label: "Name", value: selectedEmp?.name?.split("<")[0], icon: User },
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
    [selectedEmp]
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

  useEffect(() => {
    if (selectedEmp?.address?.r_date) {
      setEffectiveDate(new Date(selectedEmp.address.r_date));
    }
  }, [selectedEmp?.address?.r_date]);

  // Memoized handlers
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

      setSaveSuccess(true);
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
  ]);

  const getStatusDescription = useCallback(() => {
    switch (selectedStatus) {
      case "active":
        return "Employee is currently active and working.";
      case "notice":
        return "Employee is serving notice period.";
      case "resigned":
        return "Employee has resigned from the company.";
      default:
        return "";
    }
  }, [selectedStatus]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "notice":
        return "bg-yellow-500";
      case "resigned":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }, []);

  const getStatusButtonColor = useCallback((status) => {
    switch (status) {
      case "active":
        return "bg-green-50 border-green-200 text-green-700";
      case "notice":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "resigned":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  }, []);

  if (!selectedEmp) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 p-4 "
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/5 backdrop-blur-sm"
          onClick={() => !updating && setSelectedEmp(null)}
        />

        {/* Modal - Simplified animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[58vw] max-h-[95vh] overflow-hidden z-10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Static with minimal animations */}
          <div className="bg-gradient-to-r from-[#004368] to-[#0066a1] p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Employee Details</h2>
                <p className="text-blue-100 mt-1">
                  Complete information about {selectedEmp?.name?.split("<")[0]}
                </p>
              </div>
              <button
                onClick={() => !updating && setSelectedEmp(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                disabled={updating}
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Badge */}
            <div
              className={cn(
                "absolute -bottom-4 right-6 px-4 py-2 rounded-full text-sm font-semibold shadow-lg border",
                getStatusButtonColor(selectedStatus)
              )}
            >
              {selectedStatus?.toUpperCase()}
            </div>
          </div>

          {/* Content - Reduced animations */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info Section */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {basicInfoFields.map((field) => {
                  const IconComponent = field.icon;
                  return (
                    <div
                      key={field.label}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200/60 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {field.label}
                          </p>
                          <p className="text-gray-800 font-semibold mt-1 text-sm">
                            {field.value || (
                              <span className="text-gray-400 italic">
                                Not provided
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Salary Info Section */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                Salary Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {salaryInfoFields.map((field) => {
                  const IconComponent = field.icon;
                  return (
                    <div
                      key={field.label}
                      className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-200/60 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <IconComponent size={16} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {field.label}
                          </p>
                          <p className="text-gray-800 font-semibold mt-1 text-sm">
                            {field.value ? (
                              field.label.includes("Salary") ||
                              field.label.includes("Rate") ? (
                                `${Number(field.value).toLocaleString()}`
                              ) : (
                                field.value
                              )
                            ) : (
                              <span className="text-gray-400 italic">
                                Not provided
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Status Section */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mr-3",
                    getStatusColor(selectedStatus)
                  )}
                ></div>
                Employment Status
              </h3>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200/60">
                <RadioGroup
                  value={selectedStatus}
                  onValueChange={handleStatusChange}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                >
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
                    <div
                      key={status.value}
                      className={cn(
                        "relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200",
                        selectedStatus === status.value
                          ? getStatusButtonColor(status.value) +
                              " border-current shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <RadioGroupItem
                        value={status.value}
                        id={status.value}
                        className="sr-only"
                        disabled={updating}
                      />
                      <Label
                        htmlFor={status.value}
                        className="flex flex-col items-center justify-center cursor-pointer text-center text-[1vh]"
                      >
                        <span className="font-semibold text-[1.5vh] mb-1">
                          {status.label}
                        </span>
                        <span className=" text-gray-500">
                          {status.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Status Description */}
                <div className="text-sm p-4 bg-white rounded-lg border border-gray-200 mb-4">
                  <p className="text-gray-600 font-medium">
                    {getStatusDescription()}
                  </p>
                </div>

                {/* Date Picker for Notice/Resigned Status */}
                {selectedStatus === "resigned" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <Label
                      htmlFor="effective-date"
                      className="block mb-3 font-semibold text-gray-700"
                    >
                      📅 Resignation Effective Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-12 text-base",
                            !effectiveDate && "text-muted-foreground"
                          )}
                          disabled={updating}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5" />
                          {effectiveDate
                            ? format(effectiveDate, "PPP")
                            : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={effectiveDate}
                          onSelect={setEffectiveDate}
                          initialFocus
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-gray-500 mt-2">
                      Select the date when this status change becomes effective
                    </p>
                  </motion.div>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Status updated successfully!
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedEmp(null)}
                  disabled={updating}
                  className="flex-1 sm:flex-none px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 min-w-[120px]"
                >
                  <X size={18} />
                  Cancel
                </button>

                <button
                  onClick={handleSaveStatusChange}
                  disabled={
                    updating ||
                    (selectedStatus === "resigned" && !effectiveDate)
                  }
                  className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-[#004368] to-[#0066a1] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <BadgeCheck size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(EmployeeModal);
