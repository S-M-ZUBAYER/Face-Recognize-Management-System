import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Calendar,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Settings,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useDeviceMACs } from "@/hook/useDeviceMACs";
import { createEmployee } from "@/utils/employeeServices/EmployeeServices";
import { getApiUrl } from "@/config/config";
import { imageUrlToBase64 } from "@/lib/imageUrlToBase64";
import { useGlobalStore } from "@/zustand/useGlobalStore";
import { fetchEmployeeUseIngMac } from "@/utils/allServices/getEmployeeService";
import { fetchAttendanceUseIngMac } from "@/utils/allServices/getAttendanceService";
import { updateAttendanceUseIngMac } from "@/utils/allServices/updateAttendanceService";
import { getAllEmployeeData } from "@/utils/initializes/getAllEmployeeData";
import { fetchPayPeriodUseIngMac } from "@/utils/payPeriod/getPayPeriodUsingMac";
import { updatePayPeriod } from "@/utils/payPeriod/updatePayPeriod";
import { updateSalaryRules } from "@/utils/salaryRules/updateSalaryRules";
import { fetchSalaryRulesUseIngMac } from "@/utils/salaryRules/getSalaryRulesUsingMac";
import toast from "react-hot-toast";

const MoveDeviceModal = ({ isOpen, onClose }) => {
  const { deviceMACs } = useDeviceMACs();
  const { deviceMac } = useGlobalStore();

  // Selection state
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [migrateEmployees, setMigrateEmployees] = useState(false);
  const [migrateAttendance, setMigrateAttendance] = useState(false);
  const [migrateDeviceSetting, setMigrateDeviceSetting] = useState(false);

  // Data state
  const [employeeData, setEmployeeData] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [salaryRules, setSalaryRules] = useState(null);
  const [payPeriod, setPayPeriod] = useState(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  // Migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({
    current: 0,
    total: 0,
    type: "",
    currentItem: "",
  });
  const [migrationErrors, setMigrationErrors] = useState([]);

  /* ---------------------------------- */
  /* Fetch counts on mount */
  /* ---------------------------------- */
  useEffect(() => {
    if (isOpen && deviceMac) {
      fetchDataCounts();
    }
  }, [isOpen, deviceMac]);

  /* ---------------------------------- */
  /* Fetch employee and attendance counts */
  /* ---------------------------------- */
  const fetchDataCounts = async () => {
    setIsLoadingCounts(true);
    try {
      const [employeeRes, attendanceRes, payPeriodRes, salaryRulesRes] =
        await Promise.all([
          fetchEmployeeUseIngMac({ mac: deviceMac }),
          fetchAttendanceUseIngMac({ mac: deviceMac }),
          fetchPayPeriodUseIngMac({ mac: deviceMac }),
          fetchSalaryRulesUseIngMac({ mac: deviceMac }),
        ]);

      // console.log(payPeriodRes, salaryRulesRes);

      setEmployeeData(employeeRes);
      setAttendanceData(attendanceRes);
      setPayPeriod(payPeriodRes);
      setSalaryRules(salaryRulesRes);
      setEmployeeCount(employeeRes?.length || 0);
      setAttendanceCount(attendanceRes?.length || 0);
    } catch (error) {
      console.error("Error fetching data counts:", error);
      setEmployeeCount(0);
      setAttendanceCount(0);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  /* ---------------------------------- */
  /* Migrate single employee */
  /* ---------------------------------- */
  const migrateEmployee = async (employee, index, total) => {
    setMigrationProgress({
      current: index + 1,
      total,
      type: "employee",
      currentItem: employee.name || employee.employeeId,
    });

    try {
      const listOfDevices = JSON.stringify([
        [selectedDevice.deviceMAC, selectedDevice.deviceName],
      ]);

      const imageUrl = getApiUrl(`/media/${employee.imageFile}`);
      const base64Image = await imageUrlToBase64(imageUrl);

      const createPayload = {
        ...structuredClone(employee),
        deviceMAC: selectedDevice.deviceMAC,
        deviceName: selectedDevice.deviceName,
        imageFile: base64Image,
        listOfDevices,
      };

      await createEmployee(createPayload);

      return { success: true, employee: employee.name || employee.employeeId };
    } catch (error) {
      console.error(`Error migrating employee ${employee.employeeId}:`, error);
      return {
        success: false,
        employee: employee.name || employee.employeeId,
        error: error.message,
      };
    }
  };

  /* ---------------------------------- */
  /* Migrate single attendance record */
  /* ---------------------------------- */
  const migrateAttendanceRecord = async (attendance, index, total) => {
    setMigrationProgress({
      current: index + 1,
      total,
      type: "attendance",
      currentItem: `Record ${index + 1}`,
    });

    try {
      const updatedAttendance = {
        ...attendance,
        macId: selectedDevice.deviceMAC,
      };
      await updateAttendanceUseIngMac({ data: updatedAttendance });
      return { success: true };
    } catch (error) {
      console.error(`Error migrating attendance record ${index}:`, error);
      return { success: false, error: error.message };
    }
  };

  /* ---------------------------------- */
  /* Main migration handler */
  /* ---------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDevice) return;
    if (!migrateEmployees && !migrateAttendance && !migrateDeviceSetting) {
      alert("Please select at least one option to migrate");
      return;
    }

    setIsMigrating(true);
    setMigrationErrors([]);

    try {
      // Migrate employees
      if (migrateEmployees && employeeCount > 0) {
        const employeeResults = [];
        for (let i = 0; i < employeeData.length; i++) {
          const result = await migrateEmployee(
            employeeData[i],
            i,
            employeeData.length,
          );
          employeeResults.push(result);

          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const failedEmployees = employeeResults.filter((r) => !r.success);
        if (failedEmployees.length > 0) {
          setMigrationErrors((prev) => [
            ...prev,
            ...failedEmployees.map(
              (f) => `Employee: ${f.employee} - ${f.error}`,
            ),
          ]);
        }
      }

      // Migrate attendance
      if (migrateAttendance && attendanceCount > 0) {
        const attendanceResults = [];
        for (let i = 0; i < attendanceData.length; i++) {
          const result = await migrateAttendanceRecord(
            attendanceData[i],
            i,
            attendanceData.length,
          );
          attendanceResults.push(result);

          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const failedAttendance = attendanceResults.filter((r) => !r.success);
        if (failedAttendance.length > 0) {
          setMigrationErrors((prev) => [
            ...prev,
            ...failedAttendance.map(
              (f, idx) => `Attendance Record ${idx + 1} - ${f.error}`,
            ),
          ]);
        }
      }

      // Migrate device settings
      if (migrateDeviceSetting && payPeriod && salaryRules) {
        try {
          await updatePayPeriod({
            mac: selectedDevice.deviceMAC,
            payload: payPeriod,
          });
          await updateSalaryRules({
            mac: selectedDevice.deviceMAC,
            payload: salaryRules,
          });
          toast.success("Devices Setting Migration Success");
        } catch (error) {
          console.error("Error migrating device settings:", error);
          setMigrationErrors((prev) => [
            ...prev,
            `Device Settings: ${error.message}`,
          ]);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (migrationErrors.length === 0) {
        await getAllEmployeeData();
        handleClose();
      }
    } catch (error) {
      console.error("Migration error:", error);
      setMigrationErrors((prev) => [
        ...prev,
        `Critical error: ${error.message}`,
      ]);
    } finally {
      setIsMigrating(false);
      setMigrationProgress({ current: 0, total: 0, type: "", currentItem: "" });
    }
  };

  /* ---------------------------------- */
  /* Close handler */
  /* ---------------------------------- */
  const handleClose = () => {
    if (isMigrating) return;

    setSelectedDevice(null);
    setMigrateEmployees(false);
    setMigrateAttendance(false);
    setMigrateDeviceSetting(false);
    setMigrationProgress({ current: 0, total: 0, type: "", currentItem: "" });
    setMigrationErrors([]);
    onClose();
  };

  if (!isOpen) return null;

  const availableDevices = deviceMACs?.filter((d) => d.deviceMAC !== deviceMac);

  const progressPercentage =
    migrationProgress.total > 0
      ? (migrationProgress.current / migrationProgress.total) * 100
      : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/5 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="relative z-50 w-full max-w-lg mx-4"
        >
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004368] to-[#005580] px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Copy to Another Device
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isMigrating}
                  className="rounded-full p-1 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!isMigrating ? (
                /* Configuration Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Device Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select Destination Device
                    </label>
                    <Select
                      value={selectedDevice?.deviceMAC ?? ""}
                      onValueChange={(value) => {
                        const device = availableDevices.find(
                          (d) => d.deviceMAC === value,
                        );
                        setSelectedDevice(device || null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a device" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDevices?.map((device) => (
                          <SelectItem
                            key={device.deviceMAC}
                            value={device.deviceMAC}
                          >
                            {device.deviceName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Data Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">
                      Select Data to Migrate
                    </label>

                    {/* Employee Migration Option */}
                    <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id="migrate-employees"
                        checked={migrateEmployees}
                        onCheckedChange={(checked) => {
                          setMigrateEmployees(checked);
                          if (!checked) {
                            setMigrateAttendance(false);
                          }
                        }}
                        disabled={isLoadingCounts || employeeCount === 0}
                        className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="migrate-employees"
                          className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-[#004368]" />
                          Employee Data
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {isLoadingCounts ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            `${employeeCount} employee${employeeCount !== 1 ? "s" : ""} will be migrated`
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Attendance Migration Option */}
                    <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id="migrate-attendance"
                        checked={migrateAttendance}
                        onCheckedChange={setMigrateAttendance}
                        disabled={
                          isLoadingCounts ||
                          attendanceCount === 0 ||
                          !migrateEmployees
                        }
                        className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="migrate-attendance"
                          className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-[#004368]" />
                          Attendance Records
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {isLoadingCounts ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            `${attendanceCount} record${attendanceCount !== 1 ? "s" : ""} will be migrated`
                          )}
                        </p>
                        {!migrateEmployees && (
                          <p className="text-xs text-amber-600 mt-1">
                            ⚠️ Must select Employee Data first
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Device Setting Migration Option */}
                    <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id="device-setting"
                        checked={migrateDeviceSetting}
                        onCheckedChange={setMigrateDeviceSetting}
                        disabled={isLoadingCounts}
                        className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="device-setting"
                          className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-[#004368]" />
                          Device Settings
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {isLoadingCounts ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            "Pay period and salary rules will be migrated"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={
                        !selectedDevice ||
                        isLoadingCounts ||
                        (!migrateEmployees &&
                          !migrateAttendance &&
                          !migrateDeviceSetting)
                      }
                      className="flex-1 bg-[#004368] hover:bg-[#005580]"
                    >
                      Start Migration
                    </Button>
                  </div>
                </form>
              ) : (
                /* Migration Progress View */
                <div className="space-y-6">
                  {/* Progress Header */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#004368]/10 rounded-full mb-4">
                      <Loader2 className="w-8 h-8 text-[#004368] animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Migration in Progress
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Please wait while we transfer your data...
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {migrationProgress.type && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">
                          {migrationProgress.type === "employee"
                            ? "Migrating Employees"
                            : "Migrating Attendance"}
                        </span>
                        <span className="font-medium text-gray-900">
                          {migrationProgress.current} /{" "}
                          {migrationProgress.total}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <p className="text-xs text-gray-500 text-center">
                        Current: {migrationProgress.currentItem}
                      </p>
                    </div>
                  )}

                  {/* Completion Status */}
                  {migrationProgress.current === migrationProgress.total &&
                    migrationProgress.total > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">
                          {migrationProgress.type === "employee"
                            ? "Employees"
                            : "Attendance"}{" "}
                          migrated successfully!
                        </span>
                      </motion.div>
                    )}

                  {/* Error Display */}
                  {migrationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-red-800 font-medium">
                        <AlertCircle className="w-5 h-5" />
                        <span>Migration Errors ({migrationErrors.length})</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {migrationErrors.map((error, idx) => (
                          <p key={idx} className="text-xs text-red-600">
                            • {error}
                          </p>
                        ))}
                      </div>
                      <Button
                        onClick={handleClose}
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                      >
                        Close
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MoveDeviceModal;
