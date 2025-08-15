import React from "react";
import DeviceCard from "@/components/deviceManagement/DeviceCard";

const data = [
  {
    deviceName: "Device 1",
    MacAddress: "00:1B:44:11:3A:B7",
    EmployeeCount: 5,
  },
  {
    deviceName: "Device 2",
    MacAddress: "00:1B:44:11:3A:B8",
    EmployeeCount: 3,
  },
  { deviceName: "Device 3", MacAddress: "00:1B:44:11:3A:B9", EmployeeCount: 8 },
  { deviceName: "Device 4", MacAddress: "00:1B:44:11:3A:BA", EmployeeCount: 2 },
  { deviceName: "Device 5", MacAddress: "00:1B:44:11:3A:BB", EmployeeCount: 4 },
  { deviceName: "Device 6", MacAddress: "00:1B:44:11:3A:BC", EmployeeCount: 6 },
  { deviceName: "Device 7", MacAddress: "00:1B:44:11:3A:BD", EmployeeCount: 1 },
  { deviceName: "Device 8", MacAddress: "00:1B:44:11:3A:BE", EmployeeCount: 7 },
];

function DeviceManagementPage() {
  return (
    <>
      <div>
        <p className=" text-[18px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F] ">
          device management
        </p>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {data.map((device, index) => (
            <DeviceCard
              key={index}
              deviceName={device.deviceName}
              MacAddress={device.MacAddress}
              EmployeeCount={device.EmployeeCount}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default DeviceManagementPage;
