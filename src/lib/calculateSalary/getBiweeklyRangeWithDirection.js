import { format } from "date-fns";

function findClosestMatchingDate({ weekdayIndex, day }) {
  if (weekdayIndex < 0 || weekdayIndex > 6 || day < 1 || day > 31) {
    return null;
  }

  const today = new Date();
  const weekdayJS = weekdayIndex === 6 ? 0 : weekdayIndex + 1;

  let closestDate = null;
  let minDiff = 99999;

  for (let offset = -24; offset <= 24; offset++) {
    const testMonth = today.getMonth() + offset;
    const testYear = today.getFullYear() + Math.floor(testMonth / 12);
    const normalizedMonth = ((testMonth % 12) + 12) % 12;

    try {
      const testDate = new Date(testYear, normalizedMonth, day);

      if (testDate.getDate() !== day) continue;

      if (testDate.getDay() === weekdayJS) {
        const diff = Math.abs(testDate - today) / (1000 * 60 * 60 * 24);
        if (diff < minDiff) {
          minDiff = diff;
          closestDate = testDate;
        }
      }
    } catch {
      continue;
    }
  }

  return closestDate;
}

function getWeekOfMonth(date) {
  const targetWeekday = date.getDay();
  let occurrenceCount = 0;

  for (let day = 1; day <= date.getDate(); day++) {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), day);
    if (checkDate.getDay() === targetWeekday) {
      occurrenceCount++;
    }
  }

  return occurrenceCount - 1;
}

function getMatchingWeekdayInMonth(targetYear, targetMonth, weekdayIndex, day) {
  console.log("getMatching:", targetYear, targetMonth, weekdayIndex, day);

  // Find the source date pattern
  const sourceDate = findClosestMatchingDate({
    weekdayIndex: day,
    day: weekdayIndex,
  });

  if (!sourceDate) {
    console.log("❌ Source date not found");
    return null;
  }

  const weekday = sourceDate.getDay();
  const weekIndex = getWeekOfMonth(sourceDate);

  // First day of target month (JS months are 0-indexed)
  const firstDayOfTarget = new Date(targetYear, targetMonth - 1, 1);
  const sameWeekdays = [];

  let currentDate = new Date(firstDayOfTarget);

  // Collect all dates in target month matching the weekday
  while (currentDate.getMonth() === targetMonth - 1) {
    if (currentDate.getDay() === weekday) {
      sameWeekdays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekIndex < sameWeekdays.length ? sameWeekdays[weekIndex] : null;
}

function getBiweeklyRangeWithDirection(
  year,
  month,
  weekStartDay,
  day,
  direction = 0
) {
  // Get the matching date (this returns a Date object)
  const startDateObj = getMatchingWeekdayInMonth(
    year,
    month,
    weekStartDay,
    day
  );

  if (!startDateObj) {
    console.log("❌ Could not find matching date");
    return null;
  }

  // Apply direction offset (14 days per biweekly period)
  const directionOffset = direction * 14;

  // Create start date with direction offset
  const startDate = new Date(startDateObj);
  startDate.setDate(startDate.getDate() + directionOffset);

  // Create end date (13 days after start)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 13);

  const result = {
    startDate: format(startDate, "yyyy-MM-dd"),
    endDate: format(endDate, "yyyy-MM-dd"),
  };
  return result;
}

export default getBiweeklyRangeWithDirection;
