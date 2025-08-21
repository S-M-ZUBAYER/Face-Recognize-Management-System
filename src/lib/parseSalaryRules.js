export function parseSalaryRules(emp) {
  try {
    let salaryRules = emp.salaryRules;
    if (!salaryRules) return [];
    if (typeof salaryRules === "string") {
      salaryRules = JSON.parse(salaryRules);
    }
    let rules = salaryRules.rules;
    if (!rules) return [];
    if (typeof rules === "string") {
      rules = JSON.parse(rules);
    }
    if (Array.isArray(rules)) {
      return rules;
    }
    return [];
  } catch (err) {
    console.error("Failed to parse salaryRules or rules:", err);
    return [];
  }
}
