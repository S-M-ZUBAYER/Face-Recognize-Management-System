import React from "react";
import DeviceCard from "@/components/deviceManagement/DeviceCard";
import FancyLoader from "@/components/FancyLoader";
import { useDeviceMACs } from "@/hook/useDeviceMACs";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import useResponsiveStore from "@/zustand/useResponsiveStore";

function DeviceManagementPage() {
  const { employeeCounts } = useEmployeeStore();
  const { deviceMACs, refetch } = useDeviceMACs();
  const { isSmallLaptop } = useResponsiveStore();
  // console.log("DeviceManagementPage Re-render:", {
  //   employeeCounts,
  //   deviceMACs,
  // });
  // console.log(deviceMACs);
  const merged = deviceMACs.map((dev) => {
    const found = employeeCounts.find((c) => c.deviceMAC === dev.deviceMAC);
    return {
      ...dev,
      count: found ? found.count : 0,
      resignCount: found ? found.resignCount : 0,
    };
  });

  console.log(merged);
  return (
    <>
      <div>
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
          device list
        </p>
        <div
          className={`grid ${isSmallLaptop ? "grid-cols-3" : "grid-cols-4"} gap-4 mt-4`}
        >
          {merged ? (
            merged.map((device, index) => (
              <DeviceCard
                key={index}
                deviceName={device.deviceName}
                deviceDescription={device.deviceDescription}
                MacAddress={device.deviceMAC}
                EmployeeCount={device.count || 0}
                resignedCount={device.resignCount || 0}
                refetch={refetch}
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
