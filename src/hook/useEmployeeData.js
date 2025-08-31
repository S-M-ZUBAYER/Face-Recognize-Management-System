import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { parseSalaryRules } from "@/lib/parseSalaryRules";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";

export const useEmployeeData = () => {
  const { selectedDate, setSelectedDate } = useAttendanceStore();

  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");

  // Employees per deviceMAC
  const employeeQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["employees", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/employee/all/${mac.deviceMAC}`
          // `https://grozziie.zjweiting.com:3091/grozziie-attendance/employee/all/${mac.deviceMAC}/simple`
        );

        return res.data.map((emp) => ({
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department,
          email: emp.email,
          designation: emp.designation,
          deviceMAC: mac.deviceMAC,
          salaryRules: parseSalaryRules(emp.salaryRules || []),
          salaryInfo: JSON.parse(emp.payPeriod),
        }));
      },
    })),
  });

  //  Build counts per deviceMAC
  const employeeCounts = deviceMACs.map((mac, idx) => ({
    deviceMAC: mac.deviceMAC,
    count: employeeQueries[idx].data ? employeeQueries[idx].data.length : 0,
  }));

  const employees = employeeQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  // Global salary rules per deviceMAC
  const globalSalaryQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["salaryRules", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/salaryRules/check/${mac.deviceMAC}`
        );

        // Parse the stringified salaryRules
        const parsedSalaryRules = parseSalaryRules(res.data.salaryRules);

        return {
          deviceMAC: mac.deviceMAC,
          salaryRules: parsedSalaryRules,
        };
      },
    })),
  });

  const globalSalaryRules = globalSalaryQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  // Attendance per deviceMAC + selectedDate
  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance", mac.deviceMAC, selectedDate],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/attendance/attendance-by-date-device`,
          { params: { macId: mac.deviceMAC, date: selectedDate } }
        );
        return res.data;
      },
    })),
  });

  const attendanceData = attendanceQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  // Derive attended & absent
  const attendedIds = attendanceData.map((att) => att.empId);
  const attendedEmployees = employees.filter((emp) =>
    attendedIds.includes(emp.employeeId)
  );
  const absentEmployees = employees.filter(
    (emp) => !attendedIds.includes(emp.employeeId)
  );

  // Calculate late employees
  const totalLate = useMemo(() => {
    return attendanceData.filter((att) => {
      const employee = attendedEmployees.find(
        (e) => e.employeeId === att.empId
      );
      if (!employee || !att.checkIn) return false;

      try {
        const checkInArray = JSON.parse(att.checkIn);
        const actualCheckIn = checkInArray?.[0];

        let expectedTime = employee.salaryRules?.rules?.[0]?.param1;
        if (!expectedTime) {
          const globalRule = globalSalaryRules.find(
            (rule) => rule.deviceMAC === employee.deviceMAC
          );
          expectedTime = globalRule?.salaryRules?.rules?.[0]?.param1;
        }

        return actualCheckIn && expectedTime && actualCheckIn > expectedTime;
      } catch {
        return false;
      }
    }).length;
  }, [attendanceData, attendedEmployees, globalSalaryRules]);

  return {
    employees,
    employeeCounts,
    attendedEmployees,
    absentEmployees,
    globalSalaryRules,
    totalEmployees: employees.length,
    totalPresent: attendedEmployees.length,
    totalAbsent: absentEmployees.length,
    totalLate,
    selectedDate,
    setSelectedDate,
    isLoading:
      employeeQueries.some((q) => q.isLoading) ||
      attendanceQueries.some((q) => q.isLoading) ||
      globalSalaryQueries.some((q) => q.isLoading),
    fetchEmployees: () =>
      employeeQueries.forEach((q) => q.refetch && q.refetch()),
    refreshData: () => {
      employeeQueries.forEach((q) => q.refetch && q.refetch());
      attendanceQueries.forEach((q) => q.refetch && q.refetch());
      globalSalaryQueries.forEach((q) => q.refetch && q.refetch());
    },
  };
};
