// --- Helpers ---
function toMinutes(time) {
  if (!time && time !== 0) return 0;
  // accept "HH:MM" or numbers
  if (typeof time === "number") return Math.round(time);
  const [h = 0, m = 0] = String(time)
    .split(":")
    .map((v) => Number(v || 0));
  return (h || 0) * 60 + (m || 0);
}
function toHours(mins) {
  return mins / 60;
}
function normalizeDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch {
    return "Failed to parse date";
  }
  // fallback: return first 10 chars (YYYY-MM-DD)
  return String(dateStr).slice(0, 10);
}
function tryParseMaybeString(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return [];
    try {
      const p = JSON.parse(trimmed);
      return p;
    } catch {
      // not JSON -> maybe comma separated?
      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return val || [];
}
function getParamKeys(rule) {
  return Object.keys(rule)
    .filter((k) => /^param\d+$/.test(k))
    .sort((a, b) => {
      const ai = Number(a.replace("param", ""));
      const bi = Number(b.replace("param", ""));
      return ai - bi;
    });
}
function getParamsArray(rule) {
  if (!rule) return [];
  const keys = getParamKeys(rule);
  return keys.map((k) => (k in rule ? rule[k] : null));
}
function firstNumericParam(rule) {
  const params = getParamsArray(rule);
  for (const v of params) {
    if (v !== null && v !== undefined && String(v).trim() !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
      // if not numeric, return raw (for 'day'/'fixed' modes)
      return v;
    }
  }
  return null;
}
function firstNonEmptyParam(rule) {
  const params = getParamsArray(rule);
  for (const v of params) {
    if (v !== null && v !== undefined && String(v).trim() !== "") return v;
  }
  return null;
}
function getRuleByNumber(rules, ruleNumber) {
  // mapping: ruleId === String(ruleNumber - 1)
  if (!Array.isArray(rules)) return null;
  const id = String(ruleNumber - 1);
  return (
    rules.find((r) => String(r.ruleId) === id && Number(r.ruleStatus) === 1) ||
    null
  );
}

function roundOvertime(minutes, minUnit) {
  const unit = Number(minUnit || 0);
  if (!unit) return minutes;
  if (minutes <= 0) return 0;
  if (minutes < unit) return 0;
  const rem = minutes % unit;
  return rem === 0 ? minutes : minutes + (unit - rem);
}

// --- Main function ---
export function calculateSalary(attendanceRecords, payPeriod, salaryRules, id) {
  if (
    Object.keys(payPeriod).length === 0 &&
    Object.keys(salaryRules).length === 0
  ) {
    console.log(
      `employee id ${id} has no payPeriod and salaryRules`,
      attendanceRecords
    );
  }

  const rulesArr = Array.isArray(salaryRules.rules)
    ? salaryRules.rules
    : tryParseMaybeString(salaryRules.rules);

  // holidays/generalDays/replaceDays may be arrays or stringified arrays
  const holidaysArr = Array.isArray(salaryRules.holidays)
    ? salaryRules.holidays
    : tryParseMaybeString(salaryRules.holidays);
  const generalDaysArr = Array.isArray(salaryRules.generalDays)
    ? salaryRules.generalDays
    : tryParseMaybeString(salaryRules.generalDays);
  const replaceDaysArr = Array.isArray(salaryRules.replaceDays)
    ? salaryRules.replaceDays
    : tryParseMaybeString(salaryRules.replaceDays);

  // normalize sets
  const holidaysSet = new Set(
    (holidaysArr || []).map(normalizeDate).filter(Boolean)
  );
  const replaceDaysSet = new Set(
    (replaceDaysArr || []).map(normalizeDate).filter(Boolean)
  );
  const weekendDatesSet = new Set(
    (generalDaysArr || []).map(normalizeDate).filter(Boolean)
  ); // some setups store weekend date list here

  // build weekend day names from Rule 3 (ruleNumber 3 -> ruleId "2")
  const weekendDayNames = new Set();
  const allRule3s = (rulesArr || []).filter(
    (r) => String(r.ruleId) === String(3 - 1) && Number(r.ruleStatus) === 1
  );
  allRule3s.forEach((r) => {
    const params = getParamsArray(r);
    params.forEach((p) => {
      if (p && String(p).trim()) {
        weekendDayNames.add(String(p).trim());
      }
    });
  });

  // helpers to get rules by number (1..24)
  const getRule = (n) => getRuleByNumber(rulesArr, n);

  // Read many rules and their first/params
  const shiftRules = (rulesArr || []).filter(
    (r) => String(r.ruleId) === String(1 - 1) && Number(r.ruleStatus) === 1
  );
  // Rule 5
  const rule5 = getRule(5); // grace minutes param1
  const latenessGraceMin = Number(firstNumericParam(rule5) || 0);

  // Rule 6 flexible mapping (param1 late unit, param2 extra)
  const rule6 = getRule(6);
  const flexLateUnit = Number(rule6?.param1 || 0);
  const flexExtraUnit = Number(rule6?.param2 || 0);

  // Rule 7 replace lateness with overtime (presence means enabled)
  const rule7 = getRule(7);
  const rule7Enabled = !!rule7;

  // Rule 8 minOT
  const rule8 = getRule(8);
  const minOTUnit = Number(firstNumericParam(rule8) || 0);

  // Rule 9,10 multipliers
  const rule9 = getRule(9);
  const weekendMultiplier = Number(firstNumericParam(rule9) || 1);
  const rule10 = getRule(10);
  const holidayMultiplier = Number(firstNumericParam(rule10) || 1);

  // Rule 11 sick/other leave
  const rule11 = getRule(11);

  // Rule 13 auto replacement when OT disabled
  const rule13 = getRule(13);

  // Rule 14 absent penalty (this is ruleNumber 14 -> ruleId "13")
  const rule14 = getRule(14);
  // The parameter might be in param1 or param2 depending on how admin saved; pick first numeric param found
  const daysPenaltyPerAbsence = Number(firstNumericParam(rule14) || 0);

  // Rules 16-23 fines
  const rule16 = getRule(16);
  const latePenaltyPerOcc = Number(firstNumericParam(rule16) || 0);
  const rule17 = getRule(17);
  const earlyPenaltyPerOcc = Number(firstNumericParam(rule17) || 0);
  const rule18 = getRule(18);
  const rule19 = getRule(19);
  const perHourLatePenalty = Number(firstNumericParam(rule19) || 0);
  const rule20 = getRule(20);
  const rule20Threshold = Number((rule20 && firstNumericParam(rule20)) || 0);
  const rule20Fixed = Number(
    (rule20 && firstNonEmptyParam(rule20) && rule20.param2) || 0
  );
  const rule21 = getRule(21);
  const incrementalLateValue = Number(firstNumericParam(rule21) || 0);
  const rule22 = getRule(22);
  const dayShiftPenalty = Number(rule22?.param1 || 0);
  const nightShiftPenalty = Number(rule22?.param2 || 0);
  const rule23 = getRule(23);
  const missedPunchCost = Number(rule23?.param1 || 0);
  const missedPunchAccept = Number(rule23?.param2 || 0);

  // Rule 24 OT allowed + multiplier
  const rule24 = getRule(24);

  const overtimeAllowed = rule24 ? JSON.parse(rule24.param1) : false;
  const normalOTMultiplier = Number(rule24?.param2 || 1);

  // pay inputs
  const monthlySalary = Number(payPeriod.salary || 0);
  const otherSalary = Number(payPeriod.otherSalary || 0);
  const workingDaysConfigured = Number(payPeriod.hourlyRate || 0); // per your spec: this is working days
  const overtimeSalaryRate = Number(payPeriod.overtimeSalary || 0); // base hourly for OT pay
  const standardPay = monthlySalary + otherSalary;
  const dailySalary =
    workingDaysConfigured > 0 ? monthlySalary / workingDaysConfigured : 0;

  // initialize counters
  let lateCount = 0;
  let earlyDepartureCount = 0;
  let missedPunch = 0;
  let missedFullPunch = 0;
  let totalLatenessMinutes = 0;
  let overtimeNormal = 0;
  let overtimeWeekend = 0;
  let overtimeHoliday = 0;
  let present = 0;
  let absent = 0;
  let deductions = 0;
  let otherLeaveDeduction = 0;
  let sickLeaveDeduction = 0;
  const replacementDays = [];

  // track half/full-day lateness counts for Rule 18
  let halfDayLateCount = 0;
  let fullDayLateCount = 0;

  // loop each record (expected to be for the pay period)
  attendanceRecords.forEach((rec) => {
    const dateRaw = rec?.date;
    const date = normalizeDate(dateRaw);
    if (!date) return; // skip bad records

    // isHoliday / isWeekend check
    const isHoliday = holidaysSet.has(date);
    // weekend = either day-name match from Rule 3 OR date in generalDays list
    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const weekendByName = weekendDayNames.has(dayName);
    const weekendByDate = weekendDatesSet.has(date);
    let isWeekend =
      (weekendByName || weekendByDate) && !replaceDaysSet.has(date);

    const isReplacedWorkday = replaceDaysSet.has(date);
    const isWorkingDay = (!isHoliday && !isWeekend) || isReplacedWorkday;

    // parse checkIns: allow array or JSON-stringed array
    let checkIns = [];
    if (Array.isArray(rec?.checkIn)) checkIns = rec.checkIn;
    else if (typeof rec?.checkIn === "string") {
      try {
        checkIns = JSON.parse(rec.checkIn);
      } catch {
        checkIns = tryParseMaybeString(rec.checkIn);
      }
    } else {
      checkIns = [];
    }

    // if no punches
    if (!checkIns || checkIns.length === 0) {
      if (isWorkingDay) {
        absent += 1;
        missedFullPunch += 1;
      }
      return;
    }

    // there is at least one punch
    if (isWorkingDay) present += 1;

    // pair wise: count unmatched outs => missed punches
    // const pairs = Math.floor(checkIns.length / 2);
    const unmatched = checkIns.length % 2;
    missedPunch += unmatched; // last unmatched check-in considered a missed punch
    // count days where only single in without out as missedFullPunch? we already counted absent when zero punches
    // missedFullPunch remains as days-with-zero-punches handled earlier

    // choose first IN and last OUT for lateness/early/OT window
    const firstIn = String(checkIns[0] || "");
    const lastOut = String(checkIns[checkIns.length - 1] || "");
    const inMins = toMinutes(firstIn);
    const outMins = toMinutes(lastOut);

    // Determine applicable shift window: use first shiftRule that has params
    let shiftStart = null;
    let halfDayBoundary = null;
    let shiftEnd = null;
    let otStart = null;
    let otEnd = null;
    for (const sr of shiftRules) {
      // read every param; param1..param6
      const params = getParamsArray(sr);
      // param1..4 normal shifting; param5-6 overtime
      if (params.length > 0) {
        // param1
        shiftStart = sr.param1 ? toMinutes(sr.param1) : null;
        halfDayBoundary = sr.param2 ? toMinutes(sr.param2) : null;
        // param3 (lunch) not used for salary calc right now
        shiftEnd = sr.param4 ? toMinutes(sr.param4) : null;
        otStart = sr.param5 ? toMinutes(sr.param5) : null;
        otEnd = sr.param6 ? toMinutes(sr.param6) : null;
        break;
      }
    }

    // Lateness
    if (shiftStart !== null && shiftEnd !== null) {
      const lateThresh = shiftStart + latenessGraceMin;
      if (inMins > lateThresh) {
        const lateMins = inMins - lateThresh;
        lateCount += 1;
        totalLatenessMinutes += lateMins;

        // Rule 18 half/full day detection
        if (rule18) {
          const boundary =
            halfDayBoundary !== null ? halfDayBoundary : toMinutes("12:00");
          if (inMins < boundary) halfDayLateCount += 1;
          else fullDayLateCount += 1;
        }
      }

      // Rule 6 flexible working hours: map late -> extra leave: param1 param2
      let requiredEnd = shiftEnd;
      if (rule6 && flexLateUnit > 0 && flexExtraUnit > 0) {
        // total late minutes for this day = dayLateMins (if none then 0)
        const dayLateMins = Math.max(
          0,
          inMins - (shiftStart + latenessGraceMin)
        );
        if (dayLateMins > 0) {
          const units = Math.ceil(dayLateMins / flexLateUnit);
          requiredEnd = shiftEnd + units * flexExtraUnit;
        }
      }

      // early departure detection
      if (outMins < requiredEnd) {
        earlyDepartureCount += 1;
      }
    } else {
      // shift not configured — can't reliably compute lateness/early; skip those metrics
    }

    // Overtime calculation for the day
    const workedMinutes = Math.max(0, outMins - inMins);

    if (isHoliday) {
      overtimeHoliday += workedMinutes;
    } else if (isWeekend) {
      overtimeWeekend += workedMinutes;
    } else {
      // normal day: count only OT inside shift OT window if present
      if (otStart !== null && otEnd !== null && outMins > otStart) {
        const extra = Math.max(0, Math.min(outMins, otEnd) - otStart);
        overtimeNormal += extra;
      }
    }

    // If OT disabled and rule13 active -> weekend/holiday attendance becomes replacementDays
    if (rule13 && !overtimeAllowed && (isHoliday || isWeekend)) {
      replacementDays.push(date);
    }
  }); // end attendanceRecords loop

  // If workingDaysConfigured is provided, compute absent as workingDaysConfigured - present (clamped)
  const workingDays = Number(workingDaysConfigured || 0);
  if (workingDays > 0) {
    const computedAbsent = Math.max(0, workingDays - present);
    // keep absent as the larger of previously counted absent (days with zero punches) and computedAbsent
    absent = Math.max(absent, computedAbsent);
  } else {
    // if workingDays not provided, absent stays whatever counted from no-punch days
    // computed absent is the missedFullPunch count
    absent = Math.max(absent, missedFullPunch);
  }

  // missedFullPunch make sense as count of working-day-with-zero-punches
  // we already incremented missedFullPunch when no punches on working day

  // Rule 7: replace lateness minutes using overtime buckets in order: holiday -> weekend -> normal
  if (rule7Enabled && totalLatenessMinutes > 0) {
    let remaining = totalLatenessMinutes;
    // holiday
    const useFromHoliday = Math.min(remaining, overtimeHoliday);
    overtimeHoliday -= useFromHoliday;
    remaining -= useFromHoliday;
    // weekend
    if (remaining > 0) {
      const useFromWeekend = Math.min(remaining, overtimeWeekend);
      overtimeWeekend -= useFromWeekend;
      remaining -= useFromWeekend;
    }
    // normal
    if (remaining > 0) {
      const useFromNormal = Math.min(remaining, overtimeNormal);
      overtimeNormal -= useFromNormal;
      remaining -= useFromNormal;
    }
    // remaining lateness will still be considered for deductions (no OT replacement left)
  }

  // Rule 8: apply minimum OT rounding (minutes)
  overtimeNormal = roundOvertime(overtimeNormal, minOTUnit);
  overtimeWeekend = roundOvertime(overtimeWeekend, minOTUnit);
  overtimeHoliday = roundOvertime(overtimeHoliday, minOTUnit);

  // --- Deductions ---

  // Rule 16: late per occurrence
  if (latePenaltyPerOcc) deductions += lateCount * latePenaltyPerOcc;

  // Rule 17: early departure per occurrence
  if (earlyPenaltyPerOcc)
    deductions += earlyDepartureCount * earlyPenaltyPerOcc;

  // Rule 18: half/full-day lateness
  if (rule18) {
    deductions +=
      halfDayLateCount * (0.5 * dailySalary) + fullDayLateCount * dailySalary;
  }

  // Rule 19: hourly lateness penalty (total lateness hours * perHourLatePenalty)
  if (perHourLatePenalty)
    deductions += toHours(totalLatenessMinutes) * perHourLatePenalty;

  // Rule 20: fixed penalty if total lateness > threshold (param1 threshold minutes, param2 fixed penalty)
  if (rule20 && rule20Threshold && totalLatenessMinutes > rule20Threshold)
    deductions += rule20Fixed;

  // Rule 21: incremental lateness
  if (incrementalLateValue) {
    // incremental sum = inc * sum_{i=1..lateCount} i = inc * lateCount*(lateCount+1)/2
    deductions += (incrementalLateValue * (lateCount * (lateCount + 1))) / 2;
  }

  // Rule 22: day/night shift penalties
  if (rule22 && (dayShiftPenalty || nightShiftPenalty)) {
    // determine if primary shift is night by checking shiftRules[0].param1
    let isNightShift = false;
    if (shiftRules && shiftRules.length > 0 && shiftRules[0].param1) {
      const startMin = toMinutes(shiftRules[0].param1);
      // heuristic: start >= 18:00 is night shift
      if (startMin >= toMinutes("18:00")) isNightShift = true;
    }
    const perOccPenalty = isNightShift ? nightShiftPenalty : dayShiftPenalty;
    if (perOccPenalty) deductions += lateCount * perOccPenalty;
  }

  // Rule 23: missed punch penalty after acceptable times
  if (rule23 && missedPunchCost && missedPunch > missedPunchAccept) {
    deductions += (missedPunch - missedPunchAccept) * missedPunchCost;
  }

  // Rule 11: sick/other leave deduction: admin could set mode 'day' or fixed amount - read param1 and param2 / fallback
  if (rule11) {
    // check param keys: could be param1="day" param2="0.5" or param1="fixed" param2="200"
    const p1 = rule11.param1;
    const p2 = rule11.param2;
    if (p1 && String(p1).toLowerCase().includes("day")) {
      // p2 is fraction of days
      const frac = Number(p2 || 0);
      otherLeaveDeduction = dailySalary * frac;
    } else if (p1 && String(p1).toLowerCase().includes("fixed")) {
      otherLeaveDeduction = Number(p2 || 0);
    } else if (!p1 && p2) {
      // sometimes admin may have stored only second param as fixed or day count
      const numeric = Number(p2);
      if (!Number.isNaN(numeric)) otherLeaveDeduction = numeric;
    }
  }

  // Rule 14: per-absence deduction (daysPenaltyPerAbsence × absentDays × dailySalary)
  if (daysPenaltyPerAbsence && absent > 0) {
    deductions += daysPenaltyPerAbsence * absent * dailySalary;
  }

  // --- Overtime pay (Rules 9,10,24)
  let overtimePay = 0;
  if (overtimeAllowed) {
    // base OT rate use overtimeSalaryRate (per-hour)
    overtimePay +=
      toHours(overtimeNormal) *
      (overtimeSalaryRate || 0) *
      (normalOTMultiplier || 1);
    overtimePay +=
      toHours(overtimeWeekend) *
      (overtimeSalaryRate || 0) *
      (weekendMultiplier || 1);
    overtimePay +=
      toHours(overtimeHoliday) *
      (overtimeSalaryRate || 0) *
      (holidayMultiplier || 1);
  } else {
    // OT not allowed -> no OT pay (but replacementDays might be recorded earlier)
    overtimePay = 0;
  }

  // sickLeaveDeduction left as 0 unless you have specific sick leave records (Rule 11 could handle)
  // OtherLeaveDeduction already computed

  // --- Total pay calculation
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
    overtimeSalary: overtimeSalaryRate,
    sickLeaveDeduction,
    standardPay,
    totalPay,
    present,
    absent,
    workingDays: workingDaysConfigured,
    replacementDays,
  };
}
