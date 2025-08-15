import React from "react";
import image from "@/constants/image";
import { Button } from "../ui/button";

function DeviceCard({ deviceName, MacAddress, EmployeeCount, onSelect }) {
  const infoItems = [
    { label: "Device Name", value: deviceName },
    { label: "MAC Address", value: MacAddress },
    { label: "Employee", value: EmployeeCount },
  ];

  return (
    <div className="border border-[#E6ECF0] py-4 px-2 rounded-lg">
      {/* Icon */}
      <div className="flex items-center justify-center pb-6">
        <img src={image.deviceIcon} alt="Device Icon" />
      </div>

      {/* Info List */}
      <div className="pb-4 font-poppins">
        {infoItems.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between text-center pb-2 "
          >
            <p className=" text-[#004368] text-[12px] font-poppins-regular font-[500] ">
              {label}
            </p>
            <p className="text-[#464646] font-poppins-regular font-[400] text-[12px] ">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Select Button */}
      <Button
        onClick={onSelect}
        className="w-full bg-transparent text-[#004368] hover:bg-transparent"
        style={{ border: "1px solid #004368" }}
      >
        Select
      </Button>
    </div>
  );
}

export default DeviceCard;
