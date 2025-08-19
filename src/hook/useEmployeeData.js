import { useState, useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import axios from "axios";
import { parseSalaryRules } from "@/lib/parseSalaryRules";
import { stringifiedArrays } from "@/lib/stringifiedArrays";

export const useEmployeeData = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");

  // Employees per deviceMAC
  const employeeQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["employees", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance/employee/all/${mac.deviceMAC}`
        );
        return res.data.map((emp) => ({
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department,
          salary: emp.salary,
          email: emp.email,
          designation: emp.designation,
          deviceMAC: emp.deviceMAC,
          salaryRules: parseSalaryRules(emp),
        }));
      },
    })),
  });

  const employees = employeeQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  // Global salary rules
  const { data: globalSalaryRules = [] } = useQuery({
    queryKey: ["salaryRules"],
    queryFn: async () => {
      const res = await axios.get(
        "https://grozziie.zjweiting.com:3091/grozziie-attendance/salaryRules/all"
      );
      return stringifiedArrays(res.data);
    },
  });

  // Attendance per deviceMAC + selectedDate
  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance", mac.deviceMAC, selectedDate],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance/attendance/attendance-by-date-device`,
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

        let expectedTime = employee.salaryRules?.[0]?.param1;
        if (!expectedTime) {
          const globalRule = globalSalaryRules.find(
            (rule) => rule.deviceMAC === employee.deviceMAC
          );
          expectedTime = globalRule?.param1;
        }

        return actualCheckIn && expectedTime && actualCheckIn > expectedTime;
      } catch {
        return false;
      }
    }).length;
  }, [attendanceData, attendedEmployees, globalSalaryRules]);

  return {
    employees,
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
      attendanceQueries.some((q) => q.isLoading),
    fetchEmployees: () =>
      employeeQueries.forEach((q) => q.refetch && q.refetch()),
    refreshData: () => {
      employeeQueries.forEach((q) => q.refetch && q.refetch());
      attendanceQueries.forEach((q) => q.refetch && q.refetch());
    },
  };
};
