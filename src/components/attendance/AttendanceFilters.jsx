// components/AttendanceFilters.jsx - DUAL FILTER SELECTION
import { memo, useCallback, useMemo, useState } from "react";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useDeviceMACs } from "@/hook/useDeviceMACs";
import { ChevronDown } from "lucide-react";
import { useSelectedDeviceMACStore } from "@/zustand/useSelectedDeviceMACStore";
import { Button } from "../ui/button";

const AttendanceFilters = memo(() => {
  const { deviceMACs } = useDeviceMACs();
  // console.log(deviceMACs);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { selectedDeviceMAC, setSelectedDeviceMAC } =
    useSelectedDeviceMACStore();

  const activeFilter = useAttendanceStore((state) => state.activeFilter);
  const totalCount = useAttendanceStore((state) => state.totalCount);
  const presentCount = useAttendanceStore((state) => state.presentCount);
  const absentCount = useAttendanceStore((state) => state.absentCount);
  const lateCount = useAttendanceStore((state) => state.lateCount);
  const isFilterLoading = useAttendanceStore((state) => state.isFilterLoading);
  const setActiveFilter = useAttendanceStore((state) => state.setActiveFilter);

  const filters = useMemo(
    () => [
      { key: "punchData", label: "Original Attendance", count: totalCount },
      { key: "all", label: "All Records", count: totalCount },
      { key: "present", label: "Present", count: presentCount },
      { key: "absent", label: "Absent", count: absentCount },
      { key: "late", label: "Late", count: lateCount },
      { key: "overtime", label: "Overtime", count: null },
    ],
    [totalCount, presentCount, absentCount, lateCount],
  );

  const selectedDeviceName = useMemo(() => {
    if (selectedDeviceMAC === "all") return "All Devices";
    const device = deviceMACs?.find((d) => d.deviceMAC === selectedDeviceMAC);
    return device?.deviceDescription || "Select Device";
  }, [selectedDeviceMAC, deviceMACs]);

  const isDeviceFilterActive = selectedDeviceMAC !== "all";

  // REMOVED: Auto-deselect device when filter clicked
  const handleFilterClick = useCallback(
    (filterKey) => {
      // console.log("xx");
      if (filterKey !== activeFilter && !isFilterLoading) {
        setActiveFilter(filterKey);
        // REMOVED: setSelectedDeviceMAC("all");
      }
    },
    [activeFilter, isFilterLoading, setActiveFilter],
  );

  // REMOVED: Auto-deselect filter when device selected
  const handleDeviceSelect = useCallback(
    (deviceMAC) => {
      // console.log("yy");
      setSelectedDeviceMAC(deviceMAC);
      setIsDropdownOpen(false);
      // REMOVED: if (deviceMAC !== "all") { setActiveFilter(null); }
    },
    [setSelectedDeviceMAC], // Updated dependency
  );

  return (
    <div className="flex flex-col gap-3.5">
      <p className="text-[#1F1F1F] text-[1vw] font-[600] font-poppins-regular">
        Choose Search Type
      </p>

      <div className="flex gap-1">
        {/* Filter Buttons - Now independent of device filter */}
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => handleFilterClick(filter.key)}
            disabled={isFilterLoading}
            className={`px-2 py-1 rounded-full text-sm font-medium transition-colors relative md:px-3 md:py-2 whitespace-nowrap ${
              activeFilter === filter.key // REMOVED: && !isDeviceFilterActive
                ? "bg-[#004368] text-[#E6ECF0]"
                : "bg-transparent text-[#B0C5D0] border border-[#B0C5D0]"
            } ${
              isFilterLoading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-[#004368] hover:text-[#E6ECF0]"
            }`}
          >
            {isFilterLoading && activeFilter === filter.key && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              </div>
            )}

            <span
              className={
                isFilterLoading && activeFilter === filter.key
                  ? "opacity-0 text-[0.6vw]"
                  : "opacity-100 text-[0.6vw]"
              }
            >
              {filter.label}
              {filter.count !== null && (
                <span className="ml-1">({filter.count})</span>
              )}
            </span>
          </button>
        ))}

        {/* Device Filter Dropdown - Independent of other filters */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`px-2 py-1 rounded-full text-sm font-medium transition-colors md:px-3 md:py-3 whitespace-nowrap flex items-center gap-1.5 ${
              isDeviceFilterActive
                ? "bg-[#004368] text-[#E6ECF0]"
                : "bg-transparent text-[#B0C5D0] border border-[#B0C5D0] hover:bg-[#004368] hover:text-[#E6ECF0]"
            }`}
          >
            <span className="text-[0.6vw]">{selectedDeviceName}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                <button
                  onClick={() => handleDeviceSelect("all")}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b ${
                    selectedDeviceMAC === "all"
                      ? "bg-[#004368] text-white hover:bg-[#004368]"
                      : "text-gray-700"
                  }`}
                >
                  All Devices
                </button>

                {deviceMACs?.map((device) => (
                  <Button
                    key={device.deviceMAC}
                    onClick={() => handleDeviceSelect(device.deviceMAC)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      selectedDeviceMAC === device.deviceMAC
                        ? "bg-[#004368] text-white hover:bg-[#004368]"
                        : "text-gray-700 bg-white"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {device.deviceDescription}
                      </span>
                    </div>
                  </Button>
                ))}

                {(!deviceMACs || deviceMACs.length === 0) && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No devices available
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

AttendanceFilters.displayName = "AttendanceFilters";

export default AttendanceFilters;
