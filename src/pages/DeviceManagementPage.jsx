import React from "react";
import DeviceCard from "@/components/deviceManagement/DeviceCard";
import FancyLoader from "@/components/FancyLoader";
import { useEmployees } from "@/hook/useEmployees";
import { useDeviceMACs } from "@/hook/useDeviceMACs";

function DeviceManagementPage() {
  const { employeeCounts } = useEmployees();
  const { deviceMACs } = useDeviceMACs();
  console.log("DeviceManagementPage Re-render:", {
    employeeCounts,
    deviceMACs,
  });
  const merged = deviceMACs.map((dev) => {
    const found = employeeCounts.find((c) => c.deviceMAC === dev.deviceMAC);
    return {
      ...dev,
      count: found ? found.count : 0,
    };
  });

  return (
    <>
      <div>
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
          device list
        </p>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {merged ? (
            merged.map((device, index) => (
              <DeviceCard
                key={index}
                deviceName={device.deviceName}
                MacAddress={device.deviceMAC}
                EmployeeCount={device.count || 0}
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
