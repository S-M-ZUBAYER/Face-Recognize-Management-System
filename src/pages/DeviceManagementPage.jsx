import React from "react";
import DeviceCard from "@/components/deviceManagement/DeviceCard";
import { useUserData } from "@/hook/useUserData";
import FancyLoader from "@/components/FancyLoader";

function DeviceManagementPage() {
  const { deviceMACs } = useUserData();
  return (
    <>
      <div>
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
          device management
        </p>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {deviceMACs ? (
            deviceMACs.map((device, index) => (
              <DeviceCard
                key={index}
                deviceName={device.deviceName}
                MacAddress={device.deviceMAC}
                EmployeeCount={device.EmployeeCount || 0}
              />
            ))
          ) : (
            <FancyLoader />
          )}
        </div>
      </div>
    </>
  );
}

export default DeviceManagementPage;
