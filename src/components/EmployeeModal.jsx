import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  X,
  Loader2,
  User,
  DollarSign,
  Badge,
  Mail,
  Briefcase,
  Smartphone,
  Clock,
  Calendar,
  Building,
  Award,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Direct imports
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
  const [employeeData, setEmployeeData] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { updateEmployee: updateEmployeeField } = useEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  const primaryColor = "#004368";

  useEffect(() => {
    setEmployeeData(selectedEmp);
  }, [selectedEmp]);

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
    if (employeeData?.address?.r_date) {
      try {
        setEffectiveDate(new Date(employeeData.address.r_date));
      } catch {
        setEffectiveDate(null);
      }
    }
  }, [employeeData?.address?.r_date]);

  // Pre-computed data
  const employeeName = useMemo(
    () => employeeData?.name?.split("<")[0] || "",
    [employeeData?.name]
  );

  const basicInfoFields = useMemo(
    () => [
      { label: "Name", value: employeeName, icon: User },
      { label: "Email", value: employeeData?.email, icon: Mail },
      {
        label: "Employee ID",
        value: employeeData?.companyEmployeeId,
        icon: CreditCard,
      },
      { label: "Department", value: employeeData?.department, icon: Building },
      { label: "Designation", value: employeeData?.designation, icon: Award },
      { label: "Device MAC", value: employeeData?.deviceMAC, icon: Smartphone },
      { label: "Shift", value: employeeData?.salaryInfo?.shift, icon: Clock },
      {
        label: "Pay Period",
        value: employeeData?.salaryInfo?.payPeriod,
        icon: Calendar,
      },
    ],
    [employeeData, employeeName]
  );

  const salaryInfoFields = useMemo(
    () => [
      {
        label: "Salary",
        value: employeeData?.salaryInfo?.salary,
        icon: DollarSign,
      },
      {
        label: "Hourly Rate",
        value: employeeData?.salaryInfo?.overtimeSalary,
        icon: DollarSign,
      },
      { label: "Shift", value: employeeData?.salaryInfo?.shift, icon: Clock },
    ],
    [employeeData]
  );

  const handleStatusChange = useCallback((newStatus) => {
    setSelectedStatus(newStatus);
    if (newStatus === "active") {
      setEffectiveDate(null);
    }
  }, []);

  const handleSaveStatusChange = useCallback(async () => {
    if (selectedStatus === "resigned" && !effectiveDate) {
      toast.error("Please select an effective date");
      return;
    }

    const payload = {
      address: JSON.stringify({
        ...employeeData.address,
        type: selectedStatus,
        r_date:
          effectiveDate && selectedStatus === "resigned"
            ? format(effectiveDate, "yyyy-MM-dd")
            : "",
      }),
    };

    try {
      await updateEmployee({
        mac: employeeData.deviceMAC || "",
        id: employeeData.employeeId || employeeData.id,
        payload,
      });

      updateEmployeeField(employeeData.employeeId || employeeData.id, {
        address: JSON.parse(payload.address),
      });

      toast.success("Status updated successfully");
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSelectedEmp(null);
      }, 1500);
    } catch {
      toast.error("Failed to update status");
    }
  }, [
    employeeData,
    selectedStatus,
    effectiveDate,
    updateEmployee,
    updateEmployeeField,
    setSelectedEmp,
  ]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      active: "border-green-200 bg-green-50 text-green-700",
      notice: "border-yellow-200 bg-yellow-50 text-yellow-700",
      resigned: "border-red-200 bg-red-50 text-red-700",
    };
    return colors[status] || "border-gray-200 bg-gray-50 text-gray-700";
  }, []);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!employeeData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/5 backdrop-blur-sm"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/5"
          onClick={() => !updating && setSelectedEmp(null)}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden z-10 flex flex-col shadow-2xl border border-gray-100 custom-scrollbar "
        >
          {/* Header */}
          <div
            className="px-6 py-5 text-white border-b border-white/20"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className=" px-3 py-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={employeeData.image} />
                    <AvatarFallback className="bg-white/20 text-white font-medium">
                      {getInitials(employeeName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h2 className="text-xl font-medium">{employeeName}</h2>
                  <p className="text-sm text-white/80">Employee Details</p>
                </div>
              </div>
              <button
                onClick={() => !updating && setSelectedEmp(null)}
                className="p-2 hover:bg-white/10 rounded"
                disabled={updating}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info */}
            <div className="mb-8">
              <h3 className="text-base font-medium text-gray-800 mb-4 pb-2 border-b">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {basicInfoFields.map((field, index) => {
                  const IconComponent = field.icon;
                  return (
                    <motion.div
                      key={field.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            {field.label}
                          </p>
                          <p className="text-gray-800 font-medium">
                            {field.value || "—"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Salary Info */}
            <div className="mb-8">
              <h3 className="text-base font-medium text-gray-800 mb-4 pb-2 border-b">
                Salary Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {salaryInfoFields.map((field, index) => {
                  const IconComponent = field.icon;
                  const isMoney =
                    field.label.includes("Salary") ||
                    field.label.includes("Rate");
                  return (
                    <motion.div
                      key={field.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            {field.label}
                          </p>
                          <p className="text-gray-800 font-medium">
                            {field.value
                              ? isMoney
                                ? `$${Number(field.value).toLocaleString()}`
                                : field.value
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Status Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                <ShieldCheck size={18} />
                Employment Status
              </h3>

              <div className="space-y-6">
                {/* Status Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["active", "notice", "resigned"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updating}
                      className={cn(
                        "border rounded-lg p-4 text-left transition-all",
                        selectedStatus === status
                          ? `${getStatusColor(status)} border-2`
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="font-medium text-gray-900 capitalize mb-1">
                        {status}
                      </div>
                      <div className="text-xs text-gray-500">
                        {status === "active" && "Currently working"}
                        {status === "notice" && "Serving notice period"}
                        {status === "resigned" && "Left the company"}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Status Info */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      Current Status:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          getStatusColor(selectedStatus)
                            .replace("bg-", "text-")
                            .split(" ")[0]
                        )}
                      >
                        {selectedStatus.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedStatus === "active" &&
                      "Employee is currently active and working."}
                    {selectedStatus === "notice" &&
                      "Employee is serving notice period."}
                    {selectedStatus === "resigned" &&
                      "Employee has resigned from the company."}
                  </p>
                </div>

                {/* Date Picker */}
                <AnimatePresence>
                  {selectedStatus === "resigned" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Resignation Effective Date
                      </label>
                      <Popover
                        open={isCalendarOpen}
                        onOpenChange={setIsCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-11",
                              !effectiveDate && "text-gray-400"
                            )}
                          >
                            <Calendar size={16} className="mr-2" />
                            {effectiveDate
                              ? format(effectiveDate, "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-green-600 font-medium text-sm"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded"></div>
                    Status updated
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedEmp(null)}
                  disabled={updating}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded font-medium text-sm hover:bg-gray-50 flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStatusChange}
                  disabled={
                    updating ||
                    (selectedStatus === "resigned" && !effectiveDate)
                  }
                  className={cn(
                    "px-5 py-2.5 text-white rounded font-medium text-sm flex items-center justify-center gap-2 flex-1 sm:flex-none",
                    (updating ||
                      (selectedStatus === "resigned" && !effectiveDate)) &&
                      "opacity-50"
                  )}
                  style={{ backgroundColor: primaryColor }}
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save Changes"
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
