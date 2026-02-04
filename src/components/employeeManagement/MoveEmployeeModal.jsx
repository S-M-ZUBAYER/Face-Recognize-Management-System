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
  createEmployee,
  deleteEmployee,
  fetchEmployeeDetails,
} from "@/utils/employeeServices/EmployeeServices";
import { getApiUrl } from "@/config/config";
import { imageUrlToBase64 } from "@/lib/imageUrlToBase64";
import toast from "react-hot-toast";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { parseNormalData } from "@/lib/parseNormalData";
import parseAddress from "@/lib/parseAddress";

const MoveEmployeeModal = ({ isOpen, onClose, emp }) => {
  const { deviceMACs } = useDeviceMACs();

  const [employee, setEmployee] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { updateEmployee } = useEmployeeStore();

  /* ---------------------------------- */
  /* Load employee details */
  /* ---------------------------------- */
  useEffect(() => {
    if (!isOpen || !emp?.employeeId || !emp?.deviceMAC) return;

    const loadEmployee = async () => {
      try {
        const { data } = await fetchEmployeeDetails({
          employeeId: emp.employeeId,
          mac: emp.deviceMAC,
        });
        setEmployee(data);
      } catch (err) {
        console.error("Failed to fetch employee details", err);
      }
    };

    loadEmployee();
  }, [isOpen, emp?.employeeId, emp?.deviceMAC]);

  /* ---------------------------------- */
  /* Submit handler */
  /* ---------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee || !selectedDevice) return;

    setIsLoading(true);

    try {
      // backend expects: [[mac, name]]
      const listOfDevices = JSON.stringify([
        [selectedDevice.deviceMAC, selectedDevice.deviceName],
      ]);

      const links = getApiUrl(`/media/${employee.imageFile}`);
      // console.log(links);
      // const links =
      //   "http://192.168.1.180:8787/media/123/9477dec8-22c5-4f0e-ab5e-4944b688ea98.jpg";
      const base64 = await imageUrlToBase64(links);

      const payload = {
        ...structuredClone(employee),
        deviceMAC: selectedDevice.deviceMAC,
        deviceName: selectedDevice.deviceName,
        imageFile: base64,
        listOfDevices,
      };
      // console.log(payload);
      const response = await createEmployee(payload);
      console.log(response);
      await deleteEmployee({
        mac: employee.deviceMAC,
        id: employee.employeeId,
      });

      const updatePayload = {
        name: employee.name,
        employeeId: employee.employeeId,
        companyEmployeeId: employee.email?.split("|")[1],
        department: employee.department,
        email: employee.email?.split("|")[0],
        image: getApiUrl(`/media/${employee.imageFile}`),
        designation: employee.designation,
        deviceMAC: selectedDevice.deviceMAC,
        address: parseAddress(employee.address),
        contactNumber: employee.contactNumber,
        joiningDate: employee.startDate,
        salaryRules: parseNormalData(employee.salaryRules),
        salaryInfo: JSON.parse(employee.payPeriod || "{}"),
      };

      updateEmployee(employee.employeeId, employee.deviceMAC, updatePayload);
      toast.success("Move Employee successfully done");
      onClose();
    } catch (error) {
      console.error("Error moving device:", error);
      toast.error("Move Employee error");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------- */
  /* Close handler */
  /* ---------------------------------- */
  const handleClose = () => {
    setSelectedDevice(null);
    setEmployee(null);
    onClose();
  };

  if (!isOpen) return null;

  /* ---------------------------------- */
  /* Filter out current device */
  /* ---------------------------------- */
  const availableDevices = deviceMACs?.filter(
    (d) => d.deviceMAC !== emp?.deviceMAC,
  );

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
                  disabled={!selectedDevice || isLoading}
                  className="flex-1 bg-[#004368] hover:bg-[#004368]"
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

export default MoveEmployeeModal;
