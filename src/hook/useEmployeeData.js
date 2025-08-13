import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { parseSalaryRules } from "@/lib/parseSalaryRules";
import { stringifiedArrays } from "@/lib/stringifiedArrays";

export const useEmployeeData = () => {
  const {
    employees,
    setEmployees,
    totalEmployees,
    setTotalEmployees,
    totalPresent,
    setTotalPresent,
    totalAbsent,
    setTotalAbsent,
    attendance,
    setAttendance,
    isLoading,
    setIsLoading,
    totalLate,
    setTotalLate,
    globalSalaryRules,
    setGlobalSalaryRules,
    hasFetchedEmployees,
    setHasFetchedEmployees,
    hasFetchedSalaryRules,
    setHasFetchedSalaryRules,
  } = useEmployeeStore();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [deviceMACs] = useState(() =>
    JSON.parse(localStorage.getItem("deviceMACs") || "[]")
  );

  /** ✅ Fetch employees — only once per reload */
  const fetchAllEmployeeData = useCallback(async () => {
    if (hasFetchedEmployees) return employees; // Prevent re-fetch
    try {
      const responses = await Promise.all(
        deviceMACs.map((mac) =>
          axios.get(
            `https://grozziie.zjweiting.com:3091/grozziie-attendance/employee/all/${mac}`
          )
        )
      );

      const allEmployees = responses.flatMap((res) => res.data);

      const simplifiedEmployees = allEmployees.map((emp) => ({
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department,
        salary: emp.salary,
        email: emp.email,
        salaryRules: parseSalaryRules(emp),
        deviceMAC: emp.deviceMAC,
        designation: emp.designation,
      }));

      setEmployees(simplifiedEmployees);
      setTotalEmployees(simplifiedEmployees.length);
      setHasFetchedEmployees(true);
      return simplifiedEmployees;
    } catch (error) {
      console.error("Error fetching employee data:", error);
      return [];
    }
  }, [
    deviceMACs,
    employees,
    hasFetchedEmployees,
    setEmployees,
    setTotalEmployees,
    setHasFetchedEmployees,
  ]);

  /** ✅ Fetch global salary rules — only once per reload */
  const fetchGlobalSalaryRules = useCallback(async () => {
    if (hasFetchedSalaryRules) return globalSalaryRules; // Prevent re-fetch
    try {
      const res = await axios.get(
        "https://grozziie.zjweiting.com:3091/grozziie-attendance/salaryRules/all"
      );
      const normalData = stringifiedArrays(res.data);
      setGlobalSalaryRules(normalData);
      setHasFetchedSalaryRules(true);
      return normalData;
    } catch (error) {
      console.error("Error fetching salary rules:", error);
      return [];
    }
  }, [
    globalSalaryRules,
    hasFetchedSalaryRules,
    setGlobalSalaryRules,
    setHasFetchedSalaryRules,
  ]);

  /** ✅ Fetch attendance for specific date */
  const fetchAttendanceData = useCallback(
    async (date, employeesList) => {
      try {
        const responses = await Promise.all(
          deviceMACs.map((mac) =>
            axios.get(
              `https://grozziie.zjweiting.com:3091/grozziie-attendance/attendance/attendance-by-date-device?macId=${mac}&date=${date}`
            )
          )
        );

        const allAttendance = responses.flatMap((res) => res.data);
        setAttendance(allAttendance);
        setTotalPresent(allAttendance.length);

        let lateCount = 0;
        allAttendance.forEach((att) => {
          const employee = employeesList.find(
            (e) => e.employeeId === att.empId
          );
          if (employee && att.checkIn) {
            try {
              const checkInArray = JSON.parse(att.checkIn);
              const actualCheckIn = checkInArray?.[0];

              let expectedTime = employee.salaryRules?.[0]?.param1;
              if (!expectedTime && globalSalaryRules.length > 0) {
                const globalRule = globalSalaryRules.find(
                  (rule) => rule.deviceMAC === employee.deviceMAC
                );
                expectedTime = globalRule?.param1;
              }

              if (
                actualCheckIn &&
                expectedTime &&
                actualCheckIn > expectedTime
              ) {
                lateCount++;
              }
            } catch {
              console.warn("Invalid checkIn format", att.checkIn);
            }
          }
        });

        setTotalLate(lateCount);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    },
    [
      deviceMACs,
      setAttendance,
      setTotalPresent,
      setTotalLate,
      globalSalaryRules,
    ]
  );

  /** ✅ Auto fetch when selectedDate changes */
  useEffect(() => {
    if (deviceMACs.length === 0) return;
    let ignore = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const empList = await fetchAllEmployeeData();
        await fetchGlobalSalaryRules();
        if (!ignore) {
          await fetchAttendanceData(
            selectedDate,
            empList.length ? empList : employees
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [
    deviceMACs,
    selectedDate,
    fetchAllEmployeeData,
    fetchGlobalSalaryRules,
    fetchAttendanceData,
    employees,
    setIsLoading,
  ]);

  /** ✅ Auto calculate absent count */
  useEffect(() => {
    setTotalAbsent(Math.max(totalEmployees - totalPresent, 0));
  }, [totalEmployees, totalPresent, setTotalAbsent]);

  return {
    employees,
    totalEmployees,
    totalPresent,
    totalAbsent,
    totalLate,
    attendance,
    isLoading,
    selectedDate,
    setSelectedDate,
    fetchAllEmployeeData,
    refreshData: async () => {
      const empList = await fetchAllEmployeeData();
      await fetchGlobalSalaryRules();
      await fetchAttendanceData(selectedDate, empList);
    },
  };
};
