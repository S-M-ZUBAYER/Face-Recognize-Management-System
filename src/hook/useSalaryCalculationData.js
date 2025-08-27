import { useQueries } from "@tanstack/react-query";
import extractSalaryAndRate from "@/lib/extractSalaryAndRate";
import axios from "axios";
import { useEmployeeData } from "./useEmployeeData";
import { calculatePayMonthly } from "@/lib/calculatePayMonthly";

export const useSalaryCalculationData = () => {
  const { employees, globalSalaryRules } = useEmployeeData();
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");

  // PayPeriod per deviceMAC
  const payPeriodQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["payPeriod", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/payPeriod/check/${mac.deviceMAC}`
        );
        return {
          deviceMAC: mac.deviceMAC,
          payPeriod: extractSalaryAndRate(res.data.payPeriod),
          salaryRules: JSON.parse(res.data.salaryRules || "{}"),
        };
      },
    })),
  });

  const payPeriodData = payPeriodQueries.map((q) => q.data).filter(Boolean);

  // Attendance per deviceMAC
  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/attendance/attendance-by-device?deviceId=${mac.deviceMAC}`
        );
        return res.data;
      },
    })),
  });

  const Attendance = attendanceQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  // Helper to construct valuesList for an employee
  function getValuesList(empId, year, month) {
    const daysInMonth = new Date(year, month, 0).getDate(); // e.g., 31 for August
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1);
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;
      const record = Attendance.find(
        (r) => r.empId === empId && r.date === dateStr
      );
      if (record) {
        const checkIns = JSON.parse(record.checkIn || "[]");
        const checkOuts = JSON.parse(record.checkOut || "[]");
        return [
          day,
          checkIns[0] || "00:00",
          checkOuts[0] || "00:00",
          checkIns[1] || "00:00",
          checkOuts[1] || "00:00",
          checkIns[2] || "00:00",
          checkOuts[2] || "00:00",
        ];
      }
      return [day, "00:00", "00:00", "00:00", "00:00", "00:00", "00:00"];
    });
  }

  // Helper to get pay info and salary rules by deviceMAC
  function getPayInfoByDevice(mac) {
    const found = payPeriodData.find((d) => d.deviceMAC === mac);
    const Rule = globalSalaryRules.find((rule) => rule.deviceMAC === mac);
    return found
      ? {
          PayPeriod: found.payPeriod,
          SalaryRules: Rule?.salaryRules,
        }
      : { PayPeriod: null, SalaryRules: {} };
  }

  // Enrich employees with salary calculations
  const enrichedEmployees = employees.map((emp) => {
    let payPeriod, salaryRules;

    if (emp.salaryInfo.salary === null || emp.salaryRules.length === 0) {
      const { SalaryRules, PayPeriod } = getPayInfoByDevice(emp.deviceMAC);
      payPeriod = PayPeriod;
      salaryRules = SalaryRules;
    } else {
      payPeriod = emp.salaryInfo;
      salaryRules = { rules: emp.salaryRules };
    }

    // Skip if no pay period data
    if (!payPeriod || !salaryRules.rules) {
      return {
        ...emp,
        present: 0,
        absent: 0,
        workingDays: 0,
        salary: 0,
        salaryDetails: { error: "No pay period or salary rules available" },
      };
    }

    // Parse salary rules
    const rules = salaryRules.rules.filter((rule) => rule.ruleStatus === 1);
    const overtimePayOrNot = rules.some(
      (rule) => rule.ruleId === "23" && rule.param1 === "true"
    );
    const workHoursRule = rules.find((rule) => rule.ruleId === "0") || {};
    const overtimeIntervalRule =
      rules.find((rule) => rule.ruleId === "7") || {};
    const weekendRule = rules.find((rule) => rule.ruleId === "2") || {};

    // Construct context for calculatePayMonthly
    const now = new Date();
    const context = {
      empID: emp.employeeId,
      currentMonth: { year: now.getFullYear(), month: now.getMonth() + 1 },
      valuesList: getValuesList(
        emp.employeeId,
        now.getFullYear(),
        now.getMonth() + 1
      ),
      selectedPunchDocument: Attendance.filter(
        (r) => r.empId === emp.employeeId && r.status === "synced"
      ).map((r) => new Date(r.date).toDateString()),
      selectMissPunchDocuments: [], // Assume empty unless provided
      weekendDayIndices: weekendRule.param1 === "Friday" ? [5] : [],
      selectedHolidays: salaryRules.holidays || [],
      selectedGeneralDays: salaryRules.generalDays || [],
      replaceDays: salaryRules.replaceDays || [],
      overtimePayOrNot,
      startAMTime: workHoursRule.param1 || "08:00",
      endAMTime: workHoursRule.param2 || "12:00",
      startPMTime: workHoursRule.param3 || "13:00",
      endPMTime: workHoursRule.param4 || "17:00",
      startOvertime: workHoursRule.param5 || "18:00",
      endOvertime: workHoursRule.param6 || "20:00",
      overTimeCountPer: Number(overtimeIntervalRule.param1) || 60,
      normalOvertimeRate: 1.5,
      holidayOvertimeRate: 2.0,
      weekendOvertimeRate: 1.5,
      workingDaysInMonth: 26, // Adjust based on calendar
      sickLeaveCostDay: 1,
      sickLeaveCost: 0,
      otherLeaveCostDay: 1,
      otherLeaveCost: 0,
      selectedSickLeave: [],
      selectedOtherLeave: [],
      selectedPaternalLeave: [],
      selectedMaternalLeave: [],
      selectedMarriageLeave: [],
      selectedCompanyLeave: [],
      dbHelper: {
        deleteReplaceDayByTime: () => {},
        insertReplaceDay: () => {},
      },
      lateCount: 0,
      earlyDepartureCount: 0,
      missedPunch: 0,
      missedFullPunch: 0,
      noReasonHalf: 0,
      noReasonFull: 0,
      totalLatenessHours: 0,
      dailyLateMinutes: [],
      totalOvertime: 0,
      normalOverTime: 0,
      weekendOverTime: 0,
      holyDayOverTime: 0,
      deduction: 0,
      lastLateTime: workHoursRule.param1 || "08:00",
      lastLatePMTime: workHoursRule.param3 || "13:00",
      shift: payPeriod.shift || "Morning",
      pieceRateUnits: 0,
      pieceRate: 0,
    };

    // Calculate salary using calculatePayMonthly
    const salaryDetails = calculatePayMonthly(
      rules,
      payPeriod.hourlyRate || 0,
      payPeriod.salary || 0,
      context
    );

    // Calculate present and absent counts
    const presentCount = new Set(
      Attendance.filter((record) => {
        const recordDate = new Date(record.date);
        return (
          record.empId === emp.employeeId &&
          recordDate.getMonth() === now.getMonth() &&
          recordDate.getFullYear() === now.getFullYear() &&
          record.checkIn &&
          record.checkIn !== "[]"
        );
      }).map((r) => r.date)
    ).size;

    const totalWorkingDays = context.workingDaysInMonth;
    const absentCount =
      totalWorkingDays > 0 ? totalWorkingDays - presentCount : 0;

    return {
      ...emp,
      present: presentCount,
      absent: absentCount >= 0 ? absentCount : 0,
      workingDays: totalWorkingDays,
      salary: payPeriod.salary || 0,
      salaryDetails, // Includes standardPay, overtimePay, totalPay, deductions, etc.
    };
  });

  // Combined loading and error states
  const isLoading =
    payPeriodQueries.some((q) => q.isLoading) ||
    attendanceQueries.some((q) => q.isLoading);
  const isError =
    payPeriodQueries.some((q) => q.isError) ||
    attendanceQueries.some((q) => q.isError);

  return {
    payPeriod: payPeriodData,
    enrichedEmployees,
    isLoading,
    isError,
  };
};
