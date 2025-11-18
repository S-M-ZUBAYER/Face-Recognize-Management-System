function generateEmployeeJSON(input) {
  const normalizeValue = (value) => {
    if (value === null || value === undefined) {
      return value;
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "boolean" || typeof value === "number") {
      return String(value);
    }
    if (Array.isArray(value) || typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const normalizeOtherSalary = (salaryArray) => {
    if (!Array.isArray(salaryArray)) return "[]";

    return salaryArray.map((item) => ({
      isChecked: String(item.isChecked),
      type: String(item.type),
      amount: String(item.amount),
    }));
  };

  return {
    employeeId: normalizeValue(input.employeeId),
    hourlyRate: normalizeValue(input.hourlyRate),
    isSelectedFixedHourlyRate: normalizeValue(input.isSelectedFixedHourlyRate),
    leave: normalizeValue(input.leave),
    name: normalizeValue(input.name),
    otherSalary: Array.isArray(input.otherSalary)
      ? JSON.stringify(normalizeOtherSalary(input.otherSalary))
      : normalizeValue(input.otherSalary),
    overtimeFixed: normalizeValue(input.overtimeFixed),
    overtimeSalary: normalizeValue(input.overtimeSalary),
    payPeriod: normalizeValue(input.payPeriod),
    salary: normalizeValue(input.salary),
    selectedOvertimeOption: normalizeValue(input.selectedOvertimeOption),
    shift: normalizeValue(input.shift),
    startDay: normalizeValue(input.startDay),
    startWeek: normalizeValue(input.startWeek),
    status: normalizeValue(input.status),
  };
}

function convertJsonForPayPeriod(input, replacements = {}) {
  // Deep copy to avoid mutation
  const dataCopy = JSON.parse(JSON.stringify(input));

  // Handle replacements and updates
  for (const key of Object.keys(replacements)) {
    const replacement = replacements[key];

    if (key === "otherSalary" && Array.isArray(replacement)) {
      // Special handling for otherSalary array
      dataCopy[key] = replacement;
    } else if (
      typeof replacement === "object" &&
      replacement !== null &&
      !Array.isArray(replacement)
    ) {
      // Object-based replacement with filter (similar to your previous function)
      if (replacement.filter && replacement.newValue !== undefined) {
        if (Array.isArray(dataCopy[key])) {
          let replaced = false;
          dataCopy[key] = dataCopy[key].map((item) => {
            if (replacement.filter(item)) {
              replaced = true;
              return { ...item, ...replacement.newValue };
            }
            return item;
          });

          // If not found and it's otherSalary, add it
          if (!replaced && key === "otherSalary") {
            dataCopy[key].push(replacement.newValue);
          }
        }
      } else {
        // Direct object replacement
        dataCopy[key] = replacement;
      }
    } else {
      // Direct value replacement
      dataCopy[key] = replacement;
    }
  }

  // Generate final formatted JSON and stringify the entire object
  const normalizedData = generateEmployeeJSON(dataCopy);
  return JSON.stringify(normalizedData);
}

export default convertJsonForPayPeriod;
