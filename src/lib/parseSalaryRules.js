export function parseSalaryRules(salaryRulesStr) {
  if (!salaryRulesStr) return null;

  try {
    // First parse
    const parsed = JSON.parse(salaryRulesStr);

    // Nested fields need parsing again
    return {
      ...parsed,
      rules: parsed.rules ? JSON.parse(parsed.rules) : [],
      holidays: parsed.holidays ? JSON.parse(parsed.holidays) : [],
      generalDays: parsed.generalDays ? JSON.parse(parsed.generalDays) : [],
      replaceDays: parsed.replaceDays ? JSON.parse(parsed.replaceDays) : [],
      punchDocuments: parsed.punchDocuments
        ? JSON.parse(parsed.punchDocuments).map((docStr) => JSON.parse(docStr))
        : [],
    };
  } catch (err) {
    console.error("❌ Error parsing salaryRules:", err);
    return null;
  }
}
