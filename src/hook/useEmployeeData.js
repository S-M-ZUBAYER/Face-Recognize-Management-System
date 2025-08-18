import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { parseSalaryRules } from "@/lib/parseSalaryRules";
import { stringifiedArrays } from "@/lib/stringifiedArrays";

export const useEmployeeData = () => {
  const {
    employees,
    setEmployees,
    attendedEmployees,
    setAttendedEmployees,
    absentEmployees,
    setAbsentEmployees,
    globalSalaryRules,
    setGlobalSalaryRules,
    isLoading,
    setIsLoading,
  } = useEmployeeStore();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    const requests = deviceMACs.map(({ deviceMAC }) =>
      axios.get(
        `https://grozziie.zjweiting.com:3091/grozziie-attendance/employee/all/${deviceMAC}`
      )
    );

    const responses = await Promise.all(requests);
    const allEmployees = responses.flatMap((res) => res.data);

    const processedEmployees = allEmployees.map((emp) => ({
      name: emp.name,
      employeeId: emp.employeeId,
      department: emp.department,
      salary: emp.salary,
      email: emp.email,
      designation: emp.designation,
      deviceMAC: emp.deviceMAC,
      salaryRules: parseSalaryRules(emp),
    }));

    setEmployees(processedEmployees);
    return processedEmployees;
  }, [deviceMACs, setEmployees]);

  // Fetch salary rules
  const fetchSalaryRules = useCallback(async () => {
    const response = await axios.get(
      "https://grozziie.zjweiting.com:3091/grozziie-attendance/salaryRules/all"
    );
    const rules = stringifiedArrays(response.data);
    setGlobalSalaryRules(rules);
    return rules;
  }, [setGlobalSalaryRules]);

  // Fetch attendance and filter employees
  const fetchAttendance = useCallback(
    async (date, employeesList) => {
      const requests = deviceMACs.map(({ deviceMAC }) =>
        axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance/attendance/attendance-by-date-device`,
          {
            params: { macId: deviceMAC, date },
          }
        )
      );

      const responses = await Promise.all(requests);
      const attendanceData = responses.flatMap((res) => res.data);

      // Filter employees
      const attendedIds = attendanceData.map((att) => att.empId);
      const attended = employeesList.filter((emp) =>
        attendedIds.includes(emp.employeeId)
      );
      const absent = employeesList.filter(
        (emp) => !attendedIds.includes(emp.employeeId)
      );

      setAttendedEmployees(attended);
      setAbsentEmployees(absent);

      return attendanceData;
    },
    [deviceMACs, setAttendedEmployees, setAbsentEmployees]
  );

  // Main fetch function
  const fetchData = useCallback(async () => {
    if (!deviceMACs.length) return;

    setIsLoading(true);
    try {
      const [empList] = await Promise.all([
        fetchEmployees(),
        fetchSalaryRules(),
      ]);

      await fetchAttendance(selectedDate, empList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    deviceMACs,
    selectedDate,
    fetchEmployees,
    fetchSalaryRules,
    fetchAttendance,
    setIsLoading,
  ]);

  // Auto-fetch on date change
  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  return {
    employees,
    attendedEmployees,
    absentEmployees,
    globalSalaryRules,
    selectedDate,
    setSelectedDate,
    isLoading,
    refreshData: fetchData,
  };
};
