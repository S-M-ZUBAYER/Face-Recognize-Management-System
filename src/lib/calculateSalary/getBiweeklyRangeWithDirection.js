import {
  parseISO,
  format,
  addDays,
  // subDays,
  // startOfMonth,
  isValid,
} from "date-fns";

const TWO_WEEKS = 14;

export const getBiweeklyRangeWithDirection = (
  referenceDate,
  direction = 0,
  year = null,
  month = null,
) => {
  let baseDate;

  if (typeof referenceDate === "string") {
    const parsed = parseISO(referenceDate);
    baseDate = isValid(parsed) ? parsed : new Date();
  } else {
    baseDate = new Date();
  }

  // Step 1: determine month bounds if provided
  // let monthStart = startOfMonth(baseDate);

  // if (year && month) {
  //   monthStart = startOfMonth(new Date(year, month - 1));
  // }

  // Step 2: Align start date within the month bounds
  let startDate = baseDate;
  const fromDate = findBiWeeklyStartDate({
    source: baseDate,
    year,
    month,
  });

  startDate = fromDate;

  // Step 3: Shift by direction
  startDate = addDays(startDate, direction * TWO_WEEKS);

  // Step 4: End date = 13 days after start (14-day range)
  const endDate = addDays(startDate, TWO_WEEKS - 1);

  return {
    startDate: format(startDate, "yyyy-MM-dd"),
    endDate: format(endDate, "yyyy-MM-dd"),
  };
};

function findBiWeeklyStartDate({ source, year, month }) {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  let current = new Date(source);

  // console.log(current,monthStart,monthEnd)

  // Move backward until we're not after the month
  while (current > monthEnd) {
    current = new Date(current.getTime() - 14 * 24 * 60 * 60 * 1000);
  }

  // Move forward until we're inside the month
  while (current < monthStart) {
    current = new Date(current.getTime() + 14 * 24 * 60 * 60 * 1000);
  }

  return current;
}

export default getBiweeklyRangeWithDirection;
