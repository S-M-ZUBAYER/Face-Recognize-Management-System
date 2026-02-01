import React, { memo, useState, useCallback } from "react";
import image from "@/constants/image";
import SetDeviceModal from "./modal/SetDeviceModal";
import { useGlobalStore } from "@/zustand/useGlobalStore";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

// Constants
const INFO_ITEMS_LABELS = {
  deviceName: "Device Name",
  MacAddress: "MAC Address",
  EmployeeCount: "Employee",
};

const DeviceCard = memo(({ deviceName, MacAddress, EmployeeCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { setDeviceMac } = useGlobalStore();

  const infoItems = [
    {
      label: INFO_ITEMS_LABELS.deviceName,
      value: deviceName || "Unnamed Device",
      key: "deviceName",
    },
    {
      label: INFO_ITEMS_LABELS.MacAddress,
      value: MacAddress || "N/A",
      key: "macAddress",
    },
    {
      label: INFO_ITEMS_LABELS.EmployeeCount,
      value: EmployeeCount?.toString() || "0",
      key: "employeeCount",
    },
  ];

  const handleOpenModal = useCallback(() => {
    if (MacAddress) {
      setIsOpen(true);
      setDeviceMac(MacAddress);
    } else {
      toast.error("Invalid device MAC address");
    }
  }, [MacAddress, setDeviceMac]);

  const handleCopyMac = useCallback(async (e, mac) => {
    e.stopPropagation();

    if (!mac || mac === "N/A") {
      toast.error("No MAC address to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(mac);
      setCopied(true);
      toast.success("MAC address copied to clipboard");

      // Reset copy icon after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy MAC address");
    }
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleOpenModal();
      }
    },
    [handleOpenModal],
  );

  return (
    <>
      <div
        className="relative border border-[#E6ECF0] py-4 px-4 rounded-lg bg-white cursor-pointer group device-card hover:shadow-md transition-shadow duration-300"
        onClick={handleOpenModal}
        onKeyDown={handleKeyPress}
        role="button"
        tabIndex={0}
        aria-label={`Device card for ${deviceName || "unnamed device"}. Click to open device settings.`}
      >
        {/* Image Section */}
        <div className="flex items-center justify-center pb-6 image-container">
          <img
            src={image.product}
            alt="Device Icon"
            className="w-28 transition-all duration-300 group-hover:drop-shadow-md image-icon"
            loading="lazy"
            width={112}
            height={112}
          />
        </div>

        {/* Info Section */}
        <div className="pb-4 font-poppins space-y-3">
          {infoItems.map(({ label, value, key }) => (
            <div
              key={key}
              className="flex items-center justify-between info-item"
            >
              <p className="text-[#004368] text-[12px] font-poppins-regular font-[500] label-text min-w-[80px]">
                {label}
              </p>

              {key === "macAddress" ? (
                <div
                  className="flex items-center gap-2 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleCopyMac(e, value)}
                    className={`flex-shrink-0 p-1 rounded hover:bg-gray-100 transition ${
                      copied
                        ? "text-green-600"
                        : "text-gray-400 hover:text-[#004368]"
                    }`}
                    title={copied ? "Copied!" : "Copy MAC Address"}
                    aria-label={
                      copied ? "MAC address copied" : "Copy MAC address"
                    }
                    disabled={value === "N/A"}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <p
                    className="text-[#464646] font-poppins-regular font-[400] text-[12px] break-words"
                    title={value}
                  >
                    {value}
                  </p>
                </div>
              ) : (
                <p
                  className="text-[#464646] font-poppins-regular font-[400] text-[12px] ml-2 break-words value-text"
                  title={value}
                >
                  {key === "employeeCount"
                    ? `${value} employee${parseInt(value) !== 1 ? "s" : ""}`
                    : value}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Subtle hover border */}
        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-[#004368]/10 pointer-events-none" />
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
});

DeviceCard.displayName = "DeviceCard";

// Optional: Add prop types for better development experience
DeviceCard.propTypes = {
  deviceName: React.string,
  MacAddress: React.string,
  EmployeeCount: React.number,
};

export default DeviceCard;
