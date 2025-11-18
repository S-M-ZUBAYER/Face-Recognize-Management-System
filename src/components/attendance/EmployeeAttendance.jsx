import { useEffect, useState } from "react";
import AttendanceTable from "./AttendanceTable";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployeeAttendanceData } from "@/hook/useEmployeeAttendanceData";

const EmployeeAttendance = () => {
  const { refresh } = useEmployeeAttendanceData();
  const {
    allEmployees,
    presentEmployees,
    absentEmployees,
    overTimeEmployees,
    activeFilter,
  } = useAttendanceStore();

  const [displayedEmployees, setDisplayedEmployees] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const getFilteredEmployees = () => {
      switch (activeFilter) {
        case "present":
          return presentEmployees;
        case "absent":
          return absentEmployees;
        case "overtime":
          return overTimeEmployees;
        default:
          return allEmployees;
      }
    };

    setDisplayedEmployees(getFilteredEmployees());

    // Only show loading on very first load when there's no data
    if (isInitialLoad && allEmployees.length > 0) {
      setIsInitialLoad(false);
    }
  }, [
    activeFilter,
    allEmployees,
    presentEmployees,
    absentEmployees,
    overTimeEmployees,
    isInitialLoad,
  ]);

  useEffect(() => {
    refresh();
  }, []);

  // Only show loading on initial load when processing AND no data yet
  // if (isProcessing && isInitialLoad && allEmployees.length === 0) {
  //   return (
  //     <div className="p-6 space-y-4">
  //       <div className="flex justify-center items-center h-[65vh] ">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //           <p className="text-gray-600">Loading attendance data...</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 space-y-4">
      <AttendanceTable employees={displayedEmployees} />
    </div>
  );
};

export default EmployeeAttendance;
