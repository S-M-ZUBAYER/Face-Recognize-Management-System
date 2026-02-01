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
  MapPin,
  Phone,
  FileText,
  ChevronRight,
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
  const [expandedSection, setExpandedSection] = useState("basic"); // 'basic', 'contact', 'status'

  const dailyWorkingHours = Number(selectedEmp.salaryInfo.name || 8);
  const isFixedHourlyRate =
    selectedEmp.salaryInfo.selectedOvertimeOption === 1 || false;
  const overtimeSalaryRate = isFixedHourlyRate
    ? Number(selectedEmp.salaryInfo.overtimeFixed || 0)
    : Number(selectedEmp.salaryInfo.overtimeSalary || 0) / dailyWorkingHours;

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
      {
        label: "Name",
        value: employeeName,
        icon: User,
        animationDelay: 0,
      },
      {
        label: "Email",
        value: employeeData?.email,
        icon: Mail,
        animationDelay: 0.05,
      },
      {
        label: "Employee ID",
        value: employeeData?.companyEmployeeId,
        icon: CreditCard,
        animationDelay: 0.1,
      },
      {
        label: "Department",
        value: employeeData?.department,
        icon: Building,
        animationDelay: 0.15,
      },
      {
        label: "Designation",
        value: employeeData?.designation,
        icon: Award,
        animationDelay: 0.2,
      },
      {
        label: "Device MAC",
        value: employeeData?.deviceMAC,
        icon: Smartphone,
        animationDelay: 0.25,
      },
      {
        label: "Shift",
        value: employeeData?.salaryInfo?.shift,
        icon: Clock,
        animationDelay: 0.3,
      },
      {
        label: "Pay Period",
        value: employeeData?.salaryInfo?.payPeriod,
        icon: Calendar,
        animationDelay: 0.35,
      },
    ],
    [employeeData, employeeName]
  );

  const contactInfoFields = useMemo(
    () => [
      {
        label: "Contact Number",
        value: employeeData?.contactNumber,
        icon: Phone,
        animationDelay: 0,
      },
      {
        label: "Address",
        value: employeeData?.address?.des || "",
        icon: MapPin,
        animationDelay: 0.05,
      },
      {
        label: "Joining Date",
        value: employeeData?.joiningDate,
        icon: FileText,
        animationDelay: 0.1,
      },
    ],
    [employeeData]
  );

  const salaryInfoFields = useMemo(
    () => [
      {
        label: "Salary",
        value: employeeData?.salaryInfo?.salary,
        icon: DollarSign,
        animationDelay: 0,
      },
      {
        label: "Hourly Rate",
        value: overtimeSalaryRate,
        icon: DollarSign,
        animationDelay: 0.05,
      },
      {
        label: "Shift",
        value: employeeData?.salaryInfo?.shift,
        icon: Clock,
        animationDelay: 0.1,
      },
    ],
    [employeeData, overtimeSalaryRate]
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

      updateEmployeeField(
        employeeData.employeeId || employeeData.id,
        employeeData.deviceMAC,
        {
          address: JSON.parse(payload.address),
        }
      );

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

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
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
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="px-6 py-5 text-white border-b border-white/20"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className=" px-3 py-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={employeeData.image} />
                    <AvatarFallback className="bg-white/20 text-white font-medium">
                      {getInitials(employeeName)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <h2 className="text-xl font-medium">{employeeName}</h2>
                  <p className="text-sm text-white/80">Employee Details</p>
                </div>
              </div>
              <motion.button
                onClick={() => !updating && setSelectedEmp(null)}
                className="p-2 hover:bg-white/10 rounded"
                disabled={updating}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Expandable Sections */}
            <div className="space-y-4 mb-6">
              {/* Basic Info Section */}
              <motion.div
                className="border border-gray-200 rounded-lg overflow-hidden"
                whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
              >
                <button
                  onClick={() => toggleSection("basic")}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-gray-600" />
                    <h3 className="text-base font-medium text-gray-800">
                      Basic Information
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSection === "basic" ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={18} className="text-gray-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedSection === "basic" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2.5 ">
                          {basicInfoFields.map((field) => (
                            <motion.div
                              key={field.label}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: field.animationDelay }}
                              className="border border-gray-200 rounded-lg p-4"
                              whileHover={{
                                scale: 1.02,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <field.icon
                                  size={16}
                                  className="text-gray-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 font-medium mb-1 truncate">
                                    {field.label}
                                  </p>
                                  <p className="text-gray-800 font-medium truncate">
                                    {field.value || "—"}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Contact & Address Section */}
              <motion.div
                className="border border-gray-200 rounded-lg overflow-hidden"
                whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
              >
                <button
                  onClick={() => toggleSection("contact")}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-600" />
                    <h3 className="text-base font-medium text-gray-800">
                      Contact & Address
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSection === "contact" ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={18} className="text-gray-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedSection === "contact" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2.5">
                          {contactInfoFields.map((field) => (
                            <motion.div
                              key={field.label}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: field.animationDelay }}
                              className={cn(
                                "border border-gray-200 rounded-lg p-4",
                                field.label === "Address" && "md:col-span-2"
                              )}
                              whileHover={{
                                scale: 1.02,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <field.icon
                                  size={16}
                                  className="text-gray-500 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 font-medium mb-1">
                                    {field.label}
                                  </p>
                                  <p className="text-gray-800 font-medium break-words">
                                    {field.value || "—"}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Salary Info Section */}
              <motion.div
                className="border border-gray-200 rounded-lg overflow-hidden"
                whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
              >
                <button
                  onClick={() => toggleSection("salary")}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign size={18} className="text-gray-600" />
                    <h3 className="text-base font-medium text-gray-800">
                      Salary Information
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSection === "salary" ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={18} className="text-gray-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedSection === "salary" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2.5 ">
                          {salaryInfoFields.map((field) => {
                            const isMoney =
                              field.label.includes("Salary") ||
                              field.label.includes("Rate");
                            return (
                              <motion.div
                                key={field.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: field.animationDelay }}
                                className="border border-gray-200 rounded-lg p-4"
                                whileHover={{
                                  scale: 1.05,
                                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  {/* <field.icon
                                    size={16}
                                    className="text-gray-500"
                                  /> */}
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">
                                      {field.label}
                                    </p>
                                    <p className="text-gray-800 font-medium">
                                      {field.value
                                        ? isMoney
                                          ? `${Number(
                                              field.value
                                            ).toLocaleString()}`
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Status Section */}
              <motion.div
                className="border border-gray-200 rounded-lg overflow-hidden"
                whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
              >
                <button
                  onClick={() => toggleSection("status")}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-gray-600" />
                    <h3 className="text-base font-medium text-gray-800">
                      Employment Status
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSection === "status" ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={18} className="text-gray-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedSection === "status" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-gray-200">
                        <div className="space-y-6">
                          {/* Status Options */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2.5 ">
                            {["active", "notice", "resigned"].map((status) => (
                              <motion.button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                disabled={updating}
                                className={cn(
                                  "border rounded-lg p-4 text-left transition-all",
                                  selectedStatus === status
                                    ? `${getStatusColor(status)} border-2`
                                    : "border-gray-200 hover:border-gray-300"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="font-medium text-gray-900 capitalize mb-1">
                                  {status}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {status === "active" && "Currently working"}
                                  {status === "notice" &&
                                    "Serving notice period"}
                                  {status === "resigned" && "Left the company"}
                                </div>
                              </motion.button>
                            ))}
                          </div>

                          {/* Status Info */}
                          <motion.div
                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
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
                          </motion.div>

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
                                    <motion.div whileTap={{ scale: 0.98 }}>
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
                                    </motion.div>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border-t border-gray-200 px-6 py-4 bg-gray-50"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-green-600 font-medium text-sm"
                  >
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    ></motion.div>
                    Status updated
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 w-full  justify-end">
                <motion.button
                  onClick={() => setSelectedEmp(null)}
                  disabled={updating}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded font-medium text-sm hover:bg-gray-50 flex-1 sm:flex-none"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
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
                  whileHover={{
                    scale: !updating && 1.02,
                    boxShadow: !updating && "0 4px 12px rgba(0, 67, 104, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {updating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Loader2 className="w-4 h-4" />
                      </motion.div>
                      Saving
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(EmployeeModal);
