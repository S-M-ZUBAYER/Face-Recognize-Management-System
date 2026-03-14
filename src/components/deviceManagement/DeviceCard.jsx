import React, { memo, useState, useCallback } from "react";
import image from "@/constants/image";
import SetDeviceModal from "./modal/SetDeviceModal";
import { useGlobalStore } from "@/zustand/useGlobalStore";
import { Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { updateDeviceName } from "@/utils/allServices/updateDeviceName";
import { fetchUserData } from "@/utils/allServices/fetchUserData";

// Constants
const INFO_ITEMS_LABELS = {
  deviceName: "Device Name",
  EmployeeCount: "Active Employee",
  resignedEmployee: "Resigned Employee",
};

const DeviceCard = memo(
  ({
    deviceName,
    deviceDescription,
    MacAddress,
    EmployeeCount = 0,
    resignedCount = 0,
    refetch,
  }) => {
    // console.log(deviceDescription);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(deviceDescription || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const { setDeviceMac } = useGlobalStore();

    const infoItems = [
      {
        label: INFO_ITEMS_LABELS.deviceName,
        value: deviceDescription || "Unnamed Device",
        key: "deviceName",
        editable: true,
      },
      {
        label: INFO_ITEMS_LABELS.EmployeeCount,
        value: EmployeeCount?.toString() || "0",
        key: "employeeCount",
        editable: false,
      },
      {
        label: INFO_ITEMS_LABELS.resignedEmployee,
        value: resignedCount?.toString() || "0",
        key: "resignedCount",
        editable: false,
      },
    ];

    const handleOpenModal = useCallback(() => {
      if (isEditing) return; // Prevent opening modal while editing

      if (MacAddress) {
        setIsOpen(true);
        setDeviceMac(MacAddress);
      } else {
        toast.error("Invalid device MAC address");
      }
    }, [MacAddress, setDeviceMac, isEditing]);

    const handleKeyPress = useCallback(
      (e) => {
        if (isEditing) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpenModal();
        }
      },
      [handleOpenModal, isEditing],
    );

    // Handle edit mode toggle
    const handleEditClick = useCallback(
      (e) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditedName(deviceDescription || "");
      },
      [deviceDescription],
    );

    // Handle cancel edit
    const handleCancelEdit = useCallback(
      (e) => {
        e.stopPropagation();
        setIsEditing(false);
        setEditedName(deviceDescription || "");
      },
      [deviceDescription],
    );

    // Handle save device name
    const handleSaveName = useCallback(
      async (e) => {
        e.stopPropagation();

        if (!editedName.trim()) {
          toast.error("Device name cannot be empty");
          return;
        }

        if (editedName.trim() === deviceDescription) {
          setIsEditing(false);
          return;
        }

        setIsUpdating(true);

        try {
          await updateDeviceName({
            mac: MacAddress,
            payload: {
              deviceName: deviceName,
              deviceDescription: editedName.trim(),
            },
          });

          toast.success("Device name updated successfully");
          setIsEditing(false);

          // Refresh user data to get updated device list

          await fetchUserData();

          refetch();
        } catch (error) {
          console.error("Failed to update device name:", error);
          toast.error("Failed to update device name");
          setEditedName(deviceName || "");
        } finally {
          setIsUpdating(false);
        }
      },
      [editedName, deviceName, MacAddress, deviceDescription, refetch],
    );

    // Handle input change
    const handleNameChange = useCallback((e) => {
      setEditedName(e.target.value);
    }, []);

    // Handle Enter key in input
    const handleInputKeyPress = useCallback(
      (e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          handleSaveName(e);
        } else if (e.key === "Escape") {
          handleCancelEdit(e);
        }
      },
      [handleSaveName, handleCancelEdit],
    );

    return (
      <>
        <div
          className={`relative border border-[#E6ECF0] py-4 px-4 rounded-lg bg-white group device-card transition-all duration-300 ${
            isEditing
              ? "shadow-lg ring-2 ring-[#004368]/20"
              : "cursor-pointer hover:shadow-md"
          }`}
          onClick={isEditing ? undefined : handleOpenModal}
          onKeyDown={isEditing ? undefined : handleKeyPress}
          role="button"
          tabIndex={isEditing ? -1 : 0}
          aria-label={`Device card for ${deviceName || "unnamed device"}. Click to open device settings.`}
        >
          {/* Image Section */}
          <div className="flex items-center justify-center pb-6 image-container">
            <img
              src={image.product}
              alt="Device Icon"
              className={`w-28 transition-all duration-300 ${
                isEditing ? "opacity-50" : "group-hover:drop-shadow-md"
              }`}
              loading="lazy"
              width={112}
              height={112}
            />
          </div>

          {/* Info Section */}
          <div className="pb-4 font-poppins space-y-3">
            {infoItems.map(({ label, value, key, editable }) => (
              <div
                key={key}
                className="flex items-start justify-between info-item gap-2"
              >
                <p className="text-[#004368] text-[12px] font-poppins-regular font-[500] label-text min-w-[80px] pt-1">
                  {label}
                </p>

                <div className="flex-1">
                  {key === "deviceName" && isEditing ? (
                    // Edit Mode - Full Width Input
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={handleNameChange}
                        onKeyDown={handleInputKeyPress}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 text-[12px] border-2 border-[#004368] rounded-md focus:outline-none focus:ring-2 focus:ring-[#004368]/50 bg-white shadow-sm"
                        autoFocus
                        disabled={isUpdating}
                        placeholder="Enter device name"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveName}
                          disabled={isUpdating || !editedName.trim()}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-[#004368] hover:bg-[#005580] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? (
                            <>
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-center justify-end gap-2">
                      <p
                        className="text-[#464646] font-poppins-regular font-[400] text-[12px] break-words value-text text-right flex-1"
                        title={value}
                      >
                        {key === "employeeCount" || key === "resignedCount"
                          ? `${value} employee${Number(value) !== 1 ? "s" : ""}`
                          : value}
                      </p>
                      {editable && !isEditing && (
                        <button
                          onClick={handleEditClick}
                          className="p-1.5 text-[#004368] hover:bg-[#004368]/10 rounded-md transition-all duration-200 flex-shrink-0"
                          title="Edit device name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Subtle hover border - hide when editing */}
          {!isEditing && (
            <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-[#004368]/10 pointer-events-none transition-all duration-300" />
          )}

          {/* Editing overlay to prevent clicks */}
          {isEditing && (
            <div className="absolute inset-0 pointer-events-none" />
          )}
        </div>

        <SetDeviceModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onOpen={() => setIsOpen(true)}
          deviceName={deviceName}
          macAddress={MacAddress}
          employeeCount={EmployeeCount}
        />
      </>
    );
  },
);

DeviceCard.displayName = "DeviceCard";

// Optional: Add prop types for better development experience
DeviceCard.propTypes = {
  deviceName: React.string,
  MacAddress: React.string,
  EmployeeCount: React.number,
};

export default DeviceCard;
