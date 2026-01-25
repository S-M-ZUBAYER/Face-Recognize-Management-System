import React, { memo, useState } from "react";
import image from "@/constants/image";
import SetDeviceModal from "./modal/SetDeviceModal";
import { useGlobalStore } from "@/zustand/useGlobalStore";

// Constants
const INFO_ITEMS_LABELS = {
  deviceName: "Device Name",
  MacAddress: "MAC Address",
  EmployeeCount: "Employee",
};

const DeviceCard = memo(({ deviceName, MacAddress, EmployeeCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setDeviceMac } = useGlobalStore();
  const infoItems = [
    { label: INFO_ITEMS_LABELS.deviceName, value: deviceName },
    { label: INFO_ITEMS_LABELS.MacAddress, value: MacAddress },
    { label: INFO_ITEMS_LABELS.EmployeeCount, value: EmployeeCount },
  ];

  return (
    <>
      <div
        className="border border-[#E6ECF0] py-4 px-4 rounded-lg bg-white cursor-pointer group device-card"
        onClick={() => {
          (setIsOpen(true), setDeviceMac(MacAddress));
        }}
      >
        {/* Image Section */}
        <div className="flex items-center justify-center pb-6 image-container">
          <img
            src={image.product}
            alt="Device Icon"
            className="w-28 transition-all duration-300 group-hover:drop-shadow-md image-icon"
          />
        </div>

        {/* Info Section */}
        <div className="pb-4 font-poppins space-y-3">
          {infoItems.map(({ label, value }, index) => (
            <div
              key={label}
              className="flex items-center justify-between info-item"
              style={{ animationDelay: `${0.1 * index + 0.3}s` }}
            >
              <p className="text-[#004368] text-[12px] font-poppins-regular font-[500] label-text">
                {label}
              </p>
              <p
                className="text-[#464646] font-poppins-regular font-[400] text-[12px] truncate ml-2 value-text"
                title={value}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Subtle hover border effect */}
        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-[#004368]/10 hover-border" />
      </div>
      <SetDeviceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
      />
    </>
  );
});

DeviceCard.displayName = "DeviceCard";

export default DeviceCard;
