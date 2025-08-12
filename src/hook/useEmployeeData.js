import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { parseSalaryRules } from "@/lib/parseSalaryRules";

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
  } = useEmployeeStore();

  const [deviceMACs] = useState(() =>
    JSON.parse(localStorage.getItem("deviceMACs") || "[]")
  );

  // ✅ Fetch employees
  const fetchAllEmployeeData = useCallback(async () => {
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
      }));

      setEmployees(simplifiedEmployees);
      setTotalEmployees(simplifiedEmployees.length);

      return simplifiedEmployees; // return for chaining
    } catch (error) {
      console.error("Error fetching employee data:", error);
      return [];
    }
  }, [deviceMACs, setEmployees, setTotalEmployees]);

  // ✅ Fetch attendance
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
          if (employee && employee.salaryRules?.[0]?.param1 && att.checkIn) {
            try {
              const expectedTime = employee.salaryRules[0].param1; // "08:00"
              const checkInArray = JSON.parse(att.checkIn); // ["07:50"]
              const actualCheckIn = checkInArray?.[0]; // "07:50"

              if (
                actualCheckIn &&
                expectedTime &&
                actualCheckIn > expectedTime
              ) {
                lateCount += 1;
              }
            } catch (e) {
              console.warn("Invalid checkIn format", att.checkIn);
            }
          }
        });

        setTotalLate(lateCount);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    },
    [deviceMACs, setAttendance, setTotalPresent, setTotalLate]
  );

  // ✅ Fetch both in order
  useEffect(() => {
    const fetchData = async () => {
      if (deviceMACs.length === 0) return;

      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];

      try {
        const employeesList = await fetchAllEmployeeData(); // wait
        await fetchAttendanceData(today, employeesList); // pass employees directly
      } catch (err) {
        console.error("Error during data fetch:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [deviceMACs, fetchAllEmployeeData, fetchAttendanceData, setIsLoading]);

  // ✅ Calculate absent
  useEffect(() => {
    const absent = totalEmployees - totalPresent;
    setTotalAbsent(absent >= 0 ? absent : 0);
  }, [totalEmployees, totalPresent, setTotalAbsent]);

  return {
    employees,
    totalEmployees,
    totalPresent,
    totalAbsent,
    totalLate,
    attendance,
    fetchAllEmployeeData,
    fetchAttendanceData,
    isLoading,
  };
};
