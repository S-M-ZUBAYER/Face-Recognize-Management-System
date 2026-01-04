// utils/salaryCalculation.js
import { calculateSalary } from "@/lib/calculateSalary";
import isNightShiftSimple from "./isNightShiftSimple";

// ---------------------------------------------------------
// 🔹 Function 1: Get selected month attendance
// ---------------------------------------------------------
function getEmployeeMonthlyAttendance(
  empId,
  deviceMAC,
  Attendance,
  selectedMonth,
  selectedYear
) {
  return Attendance.filter((record) => {
    const d = new Date(record.date);
    return (
      d.getMonth() === selectedMonth &&
      d.getFullYear() === selectedYear &&
      record.empId === empId &&
      record.macId === deviceMAC
    );
  });
}

// ---------------------------------------------------------
// 🔹 Function 2: Get selected month + previous last day
// ---------------------------------------------------------
function getEmployeeMonthlyAttendanceWithNextDay(
  empId,
  deviceMAC,
  Attendance,
  selectedMonth,
  selectedYear
) {
  const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
  const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;

  const currentMonthData = getEmployeeMonthlyAttendance(
    empId,
    deviceMAC,
    Attendance,
    selectedMonth,
    selectedYear
  );

  const nextMonthData = Attendance.filter((record) => {
    const d = new Date(record.date);
    return (
      d.getMonth() === nextMonth &&
      d.getFullYear() === nextYear &&
      record.empId === empId &&
      record.macId === deviceMAC
    );
  });

  // Find first day of next month
  const firstDayNextMonth = [...nextMonthData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )[0];

  return firstDayNextMonth
    ? [...currentMonthData, firstDayNextMonth]
    : currentMonthData;
}

// ---------------------------------------------------------
// 🔹 Synchronous version (original)
// ---------------------------------------------------------
export function calculateSalaryData(
  employees,
  Attendance,
  selectedMonth,
  selectedYear
) {
  if (!Attendance || !employees || !Array.isArray(employees)) {
    return [];
  }

  return employees.map((emp) => {
    const rules = emp.salaryRules?.rules || [];
    const ruleObj = rules.find((item) => item.ruleId === 0) || {};

    const isNightShift = isNightShiftSimple(ruleObj);

    // Choose logic based on param3
    const monthlyAttendance =
      ruleObj?.param3 === "special" || isNightShift
        ? getEmployeeMonthlyAttendanceWithNextDay(
            emp.employeeId,
            emp.deviceMAC,
            Attendance,
            selectedMonth,
            selectedYear
          )
        : getEmployeeMonthlyAttendance(
            emp.employeeId,
            emp.deviceMAC,
            Attendance,
            selectedMonth,
            selectedYear
          );

    const salaryDetails = calculateSalary(
      monthlyAttendance,
      emp.salaryInfo,
      emp.salaryRules,
      emp.employeeId
    );

    return {
      ...emp,
      salary: emp.salaryInfo?.salary || 0,
      salaryDetails,
    };
  });
}

// ---------------------------------------------------------
// 🔹 Async version for better UI performance
// ---------------------------------------------------------
export async function calculateSalaryDataAsync(
  employees,
  Attendance,
  selectedMonth,
  selectedYear,
  batchSize = 5
) {
  if (!Attendance || !employees || !Array.isArray(employees)) {
    return [];
  }

  const results = [];

  // Process employees in batches to avoid blocking UI
  for (let i = 0; i < employees.length; i += batchSize) {
    const batch = employees.slice(i, i + batchSize);

    const batchResults = batch.map((emp) => {
      const rules = emp.salaryRules?.rules || [];
      const ruleObj = rules.find((item) => item.ruleId === 0) || {};
      const isNightShift = isNightShiftSimple(ruleObj);

      // Choose logic based on param3
      const monthlyAttendance =
        ruleObj?.param3 === "special" || isNightShift
          ? getEmployeeMonthlyAttendanceWithNextDay(
              emp.employeeId,
              emp.deviceMAC,
              Attendance,
              selectedMonth,
              selectedYear
            )
          : getEmployeeMonthlyAttendance(
              emp.employeeId,
              emp.deviceMAC,
              Attendance,
              selectedMonth,
              selectedYear
            );

      const salaryDetails = calculateSalary(
        monthlyAttendance,
        emp.salaryInfo,
        emp.salaryRules,
        emp.employeeId
      );

      return {
        ...emp,
        salary: emp.salaryInfo?.salary || 0,
        salaryDetails,
      };
    });

    results.push(...batchResults);

    // Yield to UI thread after each batch
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}

// ---------------------------------------------------------
// 🔹 Simple async version (if you don't need batching)
// ---------------------------------------------------------
export async function calculateSalaryDataSimpleAsync(
  employees,
  Attendance,
  selectedMonth,
  selectedYear
) {
  return new Promise((resolve) => {
    // Use setTimeout to yield to UI thread
    setTimeout(() => {
      const results = calculateSalaryData(
        employees,
        Attendance,
        selectedMonth,
        selectedYear
      );
      resolve(results);
    }, 0);
  });
}
