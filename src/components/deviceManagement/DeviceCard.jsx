import React from "react";
import image from "@/constants/image";
import { Button } from "../ui/button";

function DeviceCard({ deviceName, MacAddress, EmployeeCount }) {
  const infoItems = [
    { label: "Device Name", value: deviceName },
    { label: "MAC Address", value: MacAddress },
    { label: "Employee", value: EmployeeCount },
  ];

  return (
    <div className="border border-[#E6ECF0] py-4 px-4 rounded-lg">
      <div className="flex items-center justify-center pb-6">
        <img src={image.product} alt="Device Icon" className="w-28" />
      </div>

      <div className="pb-4 font-poppins">
        {infoItems.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between text-center pb-2 "
          >
            <p className=" text-[#004368] text-[12px] font-poppins-regular font-[500]">
              {label}
            </p>
            <p className="text-[#464646] font-poppins-regular font-[400] text-[12px]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* <Button
        onClick={onSelect}
        className="w-full bg-transparent text-[#004368] hover:bg-transparent"
        style={{ border: "1px solid #004368" }}
      >
        Select
      </Button> */}
    </div>
  );
}

export default DeviceCard;
