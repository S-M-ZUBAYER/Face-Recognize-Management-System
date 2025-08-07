export const stringifiedArrays = (array) => {
  const parsed = JSON.parse(array);

  parsed.rules = JSON.parse(parsed.rules);
  parsed.holidays = JSON.parse(parsed.holidays);
  parsed.generalDays = JSON.parse(parsed.generalDays);
  parsed.replaceDays = JSON.parse(parsed.replaceDays);
  return parsed;
};
