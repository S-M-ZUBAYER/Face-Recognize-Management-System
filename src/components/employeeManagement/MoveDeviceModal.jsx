import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDeviceMACs } from "@/hook/useDeviceMACs";
import {
  deleteEmployee,
  fetchEmployeeDetails,
} from "@/utils/employeeServices/EmployeeServices";
import { createEmployee } from "@/utils/employeeServices/EmployeeServices";

const MoveDeviceModal = ({ isOpen, onClose, emp }) => {
  const { deviceMACs } = useDeviceMACs();
  const [selectedDevice, setSelectedDevice] = useState("");
  //   const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log(deviceMACs);

  useEffect(() => {
    if (!emp?.employeeId || !emp?.deviceMAC) return;

    const loadEmployee = async () => {
      try {
        const { data } = await fetchEmployeeDetails({
          employeeId: emp.employeeId,
          mac: emp.deviceMAC,
        });
        setEmployees(data);
      } catch (err) {
        console.error("Failed to fetch employee details", err);
      }
    };

    loadEmployee();
  }, [emp?.employeeId, emp?.deviceMAC]);

  //   console.log(employees);
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    console.log(selectedDevice);
    const transformed = selectedDevice.map((d) => [d.deviceMAC, d.deviceName]);
    const finalString = JSON.stringify(transformed);

    const payload = {
      ...employees,
      deviceMAC: selectedDevice ? selectedDevice.deviceMAC : "",
      listOfDevices: finalString,
    };
    console.log(payload);
    try {
      //  await createEmployee()
      //  await deleteEmployee(employees.mac,employees.employeeId)
      //   onClose();
    } catch (error) {
      console.error("Error moving device:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDevice("");
    onClose();
  };

  if (!isOpen) return null;

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
          className="relative z-50 w-full max-w-md mx-4"
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Move to Another Device
              </h2>
              <button
                onClick={handleClose}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Device Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Device
                </label>
                <Select
                  value={selectedDevice ? selectedDevice.deviceMAC : ""}
                  onValueChange={(value) => {
                    const device = deviceMACs.find(
                      (d) => d.deviceMAC === value,
                    );
                    setSelectedDevice(device);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a device" />
                  </SelectTrigger>

                  <SelectContent>
                    {deviceMACs?.map((device) => (
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 ">
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
                  disabled={!selectedDevice || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Moving..." : "Move Device"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MoveDeviceModal;
