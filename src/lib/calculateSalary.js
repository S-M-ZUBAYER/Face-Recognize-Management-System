// utils/calculateSalary.js

// --- Helpers ---
function toMinutes(time) {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function toHours(mins) {
  return mins / 60;
}
function normalizeDate(dateStr) {
  // Accepts "YYYY-MM-DD" or ISO; returns "YYYY-MM-DD"
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    // if already "YYYY-MM-DD", return as-is
    return String(dateStr).slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}
function getDailySalary(payPeriod) {
  const monthlySalary = Number(payPeriod?.salary || 0);
  const workingDays = Number(payPeriod?.hourlyRate || 1); // hourlyRate = working days per your spec
  return workingDays > 0 ? monthlySalary / workingDays : 0;
}
function roundOvertime(minutes, minUnit) {
  const m = Number(minUnit || 0);
  if (!m) return minutes;
  if (minutes < m) return 0;
  const remainder = minutes % m;
  return remainder ? minutes + (m - remainder) : minutes;
}
function getRule(rules, n) {
  // n = rule number; ruleId is string of (n-1)
  const id = String(n - 1);
  return rules?.find(
    (r) => String(r.ruleId) === id && Number(r.ruleStatus) === 1
  );
}
function getParamsAsArray(rule) {
  if (!rule) return [];
  return [
    rule.param1,
    rule.param2,
    rule.param3,
    rule.param4,
    rule.param5,
    rule.param6,
  ].filter((v) => v !== undefined && v !== null && String(v).trim() !== "");
}
function dayNameFromDate(date) {
  return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
}
function boolFromString(v) {
  if (typeof v === "boolean") return v;
  const s = String(v || "")
    .toLowerCase()
    .trim();
  return s === "true" || s === "1" || s === "yes";
}

// --- Main ---
export function calculateSalary(attendanceRecords, payPeriod, salaryRules) {
  // Safe defaults
  if (!payPeriod || !salaryRules) {
    return {
      attendanceStats: {
        lateCount: 0,
        earlyDepartureCount: 0,
        missedPunch: 0,
        missedFullPunch: 0,
        totalLatenessHours: 0,
      },
      deductions: 0,
      otherLeaveDeduction: 0,
      overtimeDetails: { normal: 0, weekend: 0, holiday: 0 },
      overtimePay: 0,
      overtimeSalary: Number(payPeriod?.overtimeSalary || 0),
      sickLeaveDeduction: 0,
      standardPay:
        Number(payPeriod?.salary || 0) + Number(payPeriod?.otherSalary || 0),
      totalPay: 0,
      present: 0,
      absent: 0,
      workingDays: Number(payPeriod?.hourlyRate || 0),
      replacementDays: [],
    };
  }

  const rules = salaryRules.rules || [];

  // Rule 2 (holidays), Rule 3 (weekends), Rule 4 (replace weekend with workday)
  // salaryRules.holidays / generalDays / replaceDays are given as arrays (no JSON.parse).
  const holidaysSet = new Set((salaryRules.holidays || []).map(normalizeDate));
  const replaceDaysSet = new Set(
    (salaryRules.replaceDays || []).map(normalizeDate)
  );

  // Weekend day names from Rule 3 objects (ruleId "2")
  const rule3All = rules.filter(
    (r) => String(r.ruleId) === "2" && Number(r.ruleStatus) === 1
  );
  const weekendDayNames = new Set();
  rule3All.forEach((r) => {
    getParamsAsArray(r).forEach((name) => weekendDayNames.add(String(name)));
  });
  // Also support date-based weekend list if provided in salaryRules.generalDays (sometimes dates are stored)
  const weekendDateSet = new Set(
    (salaryRules.generalDays || []).map(normalizeDate)
  );

  // Rule 1 (Shifts): param1–4 normal shift; param5–6 overtime window
  // There may be multiple shift groups; use them if present; otherwise flexible mode when only cross-midnight.
  const shiftRules = rules.filter(
    (r) => String(r.ruleId) === "0" && Number(r.ruleStatus) === 1
  );

  // Rule 5: lateness grace (minutes)
  const rule5 = getRule(rules, 5);
  const latenessGraceMin = Number(rule5?.param1 || 0);

  // Rule 6: flexible working hours ratio late:extra (e.g., 1:2 -> param1=1, param2=2)
  const rule6 = getRule(rules, 6);
  const flexLateUnit = Number(rule6?.param1 || 0);
  const flexExtraUnit = Number(rule6?.param2 || 0);

  // Rule 7: replace lateness with overtime (we always apply if active)
  const rule7 = getRule(rules, 7);
  const useReplacement = !!rule7; // order is always Holiday -> Weekend -> Normal per your spec

  // Rule 8: minimum overtime unit (minutes)
  const rule8 = getRule(rules, 8);
  const minOTUnit = Number(rule8?.param1 || 0);

  // Rule 9/10: weekend & holiday OT multipliers
  const rule9 = getRule(rules, 9);
  const weekendMultiplier = Number(rule9?.param1 || 1);
  const rule10 = getRule(rules, 10);
  const holidayMultiplier = Number(rule10?.param1 || 1);

  // Rule 11: sick/other leave deduction (mode + value)
  const rule11 = getRule(rules, 11); // param1: "day" or "fixed", param2: value

  // Rule 13: auto replacement (no-OT employees)
  const rule13 = getRule(rules, 13);

  // Rule 14: per-absence penalty (days to deduct per absence)
  const rule14 = getRule(rules, 14);
  const daysPenaltyPerAbsence = Number(rule14?.param1 || 0);

  // Rule 16: late per-occurrence
  const rule16 = getRule(rules, 16);
  const latePenaltyPerOccurrence = Number(rule16?.param1 || 0);

  // Rule 17: early departure per-occurrence
  const rule17 = getRule(rules, 17);
  const earlyPenaltyPerOccurrence = Number(rule17?.param1 || 0);

  // Rule 18: Late < half-day => 0.5 day; Late >= half-day => 1 day (per-day basis)
  const rule18 = getRule(rules, 18);

  // Rule 19: penalty per hour of total lateness
  const rule19 = getRule(rules, 19);
  const perHourLatePenalty = Number(rule19?.param1 || 0);

  // Rule 20: fixed penalty if total lateness minutes exceed threshold
  const rule20 = getRule(rules, 20);
  const rule20ThresholdMin = Number(rule20?.param1 || 0);
  const rule20FixedPenalty = Number(rule20?.param2 || 0);

  // Rule 21: incremental late fines (inc, applied 1x + 2x + ... n)
  const rule21 = getRule(rules, 21);
  const incrementalLate = Number(rule21?.param1 || 0);

  // Rule 22: day/night shift lateness penalties
  const rule22 = getRule(rules, 22);
  const dayShiftLatePenalty = Number(rule22?.param1 || 0);
  const nightShiftLatePenalty = Number(rule22?.param2 || 0);

  // Rule 23: Missed punch penalty after acceptable count
  const rule23 = getRule(rules, 23);
  const missedPunchCost = Number(rule23?.param1 || 0);
  const missedAcceptableTimes = Number(rule23?.param2 || 0);

  // Rule 24: OT allowed? Normal OT multiplier
  const rule24 = getRule(rules, 24);
  const overtimeAllowed = boolFromString(rule24?.param1);
  const normalOTMultiplier = Number(rule24?.param2 || 1);

  // Pay inputs
  const baseSalary = Number(payPeriod.salary || 0);
  const otherSalary = Number(payPeriod.otherSalary || 0);
  const workingDays = Number(payPeriod.hourlyRate || 0); // "working days" per your definition
  const hourlyRateForOT = Number(payPeriod.hourlyRate || 0); // you told earlier "hourlyRate" stores working days, but OT rate is from rules; we use this as base rate per prior spec usage
  const overtimeSalary = Number(payPeriod.overtimeSalary || 0); // returning for reference
  const standardPay = baseSalary + otherSalary;
  const dailySalary = getDailySalary(payPeriod);

  // Totals / counters
  let lateCount = 0;
  let earlyDepartureCount = 0;
  let missedPunch = 0;
  let missedFullPunch = 0;
  let totalLatenessMinutes = 0;
  let overtimeNormal = 0;
  let overtimeWeekend = 0;
  let overtimeHoliday = 0;
  let deductions = 0;
  let sickLeaveDeduction = 0;
  let otherLeaveDeduction = 0;
  let present = 0;
  let absent = 0;

  // For Rule 18 (per-day half/full day late deductions)
  let halfDayLateCount = 0;
  let fullDayLateCount = 0;

  // For Rule 13 (replacement days list generated)
  const replacementDays = [];

  // Utility: determine if weekend for a given date
  const isWeekendDay = (dateStr) => {
    const dNorm = normalizeDate(dateStr);
    const dayName = dayNameFromDate(dNorm);
    const weekendByName = weekendDayNames.has(dayName);
    const weekendByDate = weekendDateSet.has(dNorm);
    const replaced = replaceDaysSet.has(dNorm); // if true, it's a workday despite weekend
    return (weekendByName || weekendByDate) && !replaced;
  };

  // Process each daily record
  (attendanceRecords || []).forEach((record) => {
    const dateStrRaw = record?.date;
    const dateStr = normalizeDate(dateStrRaw);
    const isHoliday = holidaysSet.has(dateStr);
    const isWeekend = isWeekendDay(dateStr);

    // Working day if NOT holiday and NOT weekend OR (weekend but replaced as workday)
    const isReplacedWorkday = replaceDaysSet.has(dateStr);
    const isWorkingDay = (!isHoliday && !isWeekend) || isReplacedWorkday;

    let punches = [];
    try {
      punches = Array.isArray(record?.checkIn)
        ? record.checkIn
        : JSON.parse(record?.checkIn || "[]");
    } catch {
      punches = [];
    }

    if (!punches || punches.length === 0) {
      // No punches at all
      if (isWorkingDay) absent += 1;
      // Not counting missedFullPunch here (this is a true absence)
      return;
    }

    // There is at least one punch
    if (isWorkingDay) present += 1;

    // Pair up (in,out)
    const pairCount = Math.floor(punches.length / 2);
    if (pairCount === 0) {
      missedPunch += 1; // single in without out
      missedFullPunch += 1;
    } else if (punches.length % 2 === 1) {
      // Odd count -> last out missing
      missedPunch += 1;
    }

    // Use the first IN and last OUT for lateness / early checks and OT windows
    const firstIn = punches[0];
    const lastOut = punches[punches.length - 1];

    const inMins = toMinutes(firstIn);
    const outMins = toMinutes(lastOut);

    // Determine applicable shift window for this date from Rule 1
    // (support multiple shift rules; pick the first with usable params)
    let shiftStart = null,
      halfDayBoundary = null,
      lunchStart = null,
      shiftEnd = null,
      otStart = null,
      otEnd = null;

    for (const sr of shiftRules) {
      // param1–4 = normal shift; param5–6 = OT period
      const p1 = sr?.param1,
        p2 = sr?.param2,
        p3 = sr?.param3,
        p4 = sr?.param4,
        p5 = sr?.param5,
        p6 = sr?.param6;
      if (p1 || p2 || p3 || p4) {
        shiftStart = toMinutes(p1); // e.g., "08:10"
        halfDayBoundary = toMinutes(p2); // e.g., "12:00" (morning end)
        lunchStart = toMinutes(p3); // e.g., "13:08"
        shiftEnd = toMinutes(p4); // e.g., "17:00"
        otStart = p5 ? toMinutes(p5) : null; // e.g., "18:09"
        otEnd = p6 ? toMinutes(p6) : null; // e.g., "20:00"
        break;
      }
    }

    // Lateness & Early departure use shift times if available
    if (shiftStart !== null && shiftEnd !== null) {
      // Rule 5: Grace
      const lateThreshold = shiftStart + latenessGraceMin;

      let dayLateMinutes = 0;
      if (inMins > lateThreshold) {
        dayLateMinutes = inMins - lateThreshold;
        lateCount += 1;
        totalLatenessMinutes += dayLateMinutes;

        // Rule 18: per-day half/full-day penalties using half-day boundary (if provided) else 12:00
        if (rule18) {
          const boundary = halfDayBoundary ?? toMinutes("12:00");
          if (inMins < boundary) halfDayLateCount += 1;
          else fullDayLateCount += 1;
        }
      }

      // Rule 6: Flexible working hours (extend required end based on lateness)
      let requiredEnd = shiftEnd;
      if (rule6 && flexLateUnit > 0) {
        const units = Math.ceil(dayLateMinutes / flexLateUnit);
        requiredEnd = shiftEnd + units * flexExtraUnit;
      }

      if (outMins < requiredEnd) {
        earlyDepartureCount += 1;
      }
    }

    // Overtime minutes
    // If weekend or holiday -> all worked time is the respective overtime bucket
    const totalWorkedToday =
      pairCount > 0
        ? toMinutes(punches[punches.length - 1]) - toMinutes(punches[0])
        : 0;

    if (isHoliday) {
      overtimeHoliday += Math.max(0, totalWorkedToday);
    } else if (isWeekend) {
      overtimeWeekend += Math.max(0, totalWorkedToday);
    } else {
      // Normal day: only count beyond specified OT window if present
      if (otStart !== null && otEnd !== null && outMins > otStart) {
        const segment = Math.max(0, Math.min(outMins, otEnd) - otStart);
        overtimeNormal += segment;
      }
    }

    // Rule 13: If no OT option and rule is active, mark weekend/holiday attendance as replacement days
    if (rule13 && !overtimeAllowed && (isHoliday || isWeekend)) {
      replacementDays.push(dateStr);
    }
  });

  // Rule 7: replace lateness with OT minutes in order: Holiday -> Weekend -> Normal
  if (useReplacement && totalLatenessMinutes > 0) {
    let remaining = totalLatenessMinutes;
    const buckets = [
      {
        key: "holiday",
        ref: () => overtimeHoliday,
        set: (v) => (overtimeHoliday = v),
      },
      {
        key: "weekend",
        ref: () => overtimeWeekend,
        set: (v) => (overtimeWeekend = v),
      },
      {
        key: "normal",
        ref: () => overtimeNormal,
        set: (v) => (overtimeNormal = v),
      },
    ];
    for (const b of buckets) {
      if (remaining <= 0) break;
      const have = b.ref();
      const use = Math.min(remaining, have);
      b.set(have - use);
      remaining -= use;
    }
  }

  // Rule 8: apply minimum OT unit rounding
  overtimeNormal = roundOvertime(overtimeNormal, minOTUnit);
  overtimeWeekend = roundOvertime(overtimeWeekend, minOTUnit);
  overtimeHoliday = roundOvertime(overtimeHoliday, minOTUnit);

  // --- Deductions (Rules 16–23, 11, 14, 18, 19, 20, 21, 22, 23) ---

  // Rule 16
  if (latePenaltyPerOccurrence) {
    deductions += lateCount * latePenaltyPerOccurrence;
  }

  // Rule 17
  if (earlyPenaltyPerOccurrence) {
    deductions += earlyDepartureCount * earlyPenaltyPerOccurrence;
  }

  // Rule 18: per-day half/full-day late salary deduction
  if (rule18) {
    deductions +=
      halfDayLateCount * (0.5 * dailySalary) + fullDayLateCount * dailySalary;
  }

  // Rule 19: penalty per hour of lateness (total across cycle)
  if (perHourLatePenalty) {
    deductions += toHours(totalLatenessMinutes) * perHourLatePenalty;
  }

  // Rule 20: fixed penalty if total lateness exceeds threshold (minutes)
  if (
    rule20 &&
    rule20ThresholdMin &&
    totalLatenessMinutes > rule20ThresholdMin
  ) {
    deductions += rule20FixedPenalty;
  }

  // Rule 21: incremental penalty across late occurrences
  if (incrementalLate) {
    // Sum 1..n = n(n+1)/2
    deductions += (incrementalLate * (lateCount * (lateCount + 1))) / 2;
  }

  // Rule 22: day/night shift late penalty per occurrence (decide shift by start time)
  if (rule22) {
    // If we had any late occurrences, apply per-occurrence based on day/night shift.
    // Decide shift from primary Rule 1 window start
    let isNightShift = false;
    const refShift = shiftRules[0];
    if (refShift?.param1) {
      const startMin = toMinutes(refShift.param1);
      // Consider 18:00+ a night shift (heuristic)
      isNightShift = startMin >= toMinutes("18:00");
    }
    const perOcc = isNightShift ? nightShiftLatePenalty : dayShiftLatePenalty;
    if (perOcc) deductions += lateCount * perOcc;
  }

  // Rule 23: missed punch penalties beyond acceptable count
  if (rule23 && missedPunch > missedAcceptableTimes) {
    deductions += (missedPunch - missedAcceptableTimes) * missedPunchCost;
  }

  // Rule 11: sick/other leave deduction (admin selects one: day or fixed)
  if (rule11) {
    const mode = String(rule11.param1 || "").toLowerCase(); // "day" or "fixed"
    const val = Number(rule11.param2 || 0);
    if (mode === "day") {
      otherLeaveDeduction = dailySalary * val; // e.g., 0.5 day => dailySalary * 0.5
    } else {
      otherLeaveDeduction = val; // fixed amount
    }
  }

  // Rule 14: per-absence salary deduction (daysPenaltyPerAbsence × absentDays × dailySalary)
  if (daysPenaltyPerAbsence && absent > 0) {
    deductions += daysPenaltyPerAbsence * absent * dailySalary;
  }

  // --- Overtime pay (Rules 9,10,24) ---
  let overtimePay = 0;
  if (overtimeAllowed) {
    // Normal OT uses Rule 24 multiplier
    overtimePay +=
      toHours(overtimeNormal) * hourlyRateForOT * (normalOTMultiplier || 1);
    // Weekend/Holiday OT use Rules 9/10 multipliers
    overtimePay +=
      toHours(overtimeWeekend) * hourlyRateForOT * (weekendMultiplier || 1);
    overtimePay +=
      toHours(overtimeHoliday) * hourlyRateForOT * (holidayMultiplier || 1);
  } else {
    // No OT pay when OT not allowed
    overtimePay = 0;
  }

  // Compute total
  const totalPay =
    standardPay -
    deductions -
    otherLeaveDeduction +
    overtimePay -
    sickLeaveDeduction;

  return {
    attendanceStats: {
      lateCount,
      earlyDepartureCount,
      missedPunch,
      missedFullPunch,
      totalLatenessHours: toHours(totalLatenessMinutes),
    },
    deductions,
    otherLeaveDeduction,
    overtimeDetails: {
      normal: toHours(overtimeNormal),
      weekend: toHours(overtimeWeekend),
      holiday: toHours(overtimeHoliday),
    },
    overtimePay,
    overtimeSalary, // just returned for reference as you requested
    sickLeaveDeduction,
    standardPay,
    totalPay,
    present,
    absent,
    workingDays,
    replacementDays, // produced by Rule 13 when OT is disabled
  };
}
