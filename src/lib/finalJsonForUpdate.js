function generateEmployeeDataJSON(input) {
  const normalizeRule = (rule) => ({
    id: Number(rule.id),
    empId: String(input.empId),
    ruleId: String(rule.ruleId),
    ruleStatus: Number(rule.ruleStatus),
    param1:
      rule.param1 === null || typeof rule.param1 === "string"
        ? rule.param1
        : JSON.stringify(rule.param1),
    param2:
      rule.param2 === null || typeof rule.param2 === "string"
        ? rule.param2
        : JSON.stringify(rule.param2),
    param3:
      rule.param3 === null || typeof rule.param3 === "string"
        ? rule.param3
        : JSON.stringify(rule.param3),
    param4:
      rule.param4 === null || typeof rule.param4 === "string"
        ? rule.param4
        : JSON.stringify(rule.param4),
    param5:
      rule.param5 === null || typeof rule.param5 === "string"
        ? rule.param5
        : JSON.stringify(rule.param5),
    param6:
      rule.param6 === null || typeof rule.param6 === "string"
        ? rule.param6
        : JSON.stringify(rule.param6),
  });

  const normalizeTimeTable = (tt) => ({
    ...tt,
    empId: String(tt.empId),
    ruleId: String(tt.ruleId),
  });

  const safeStringify = (value) => {
    if (Array.isArray(value) || typeof value === "object") {
      return JSON.stringify(value ?? []);
    }
    if (typeof value === "string") {
      try {
        JSON.parse(value);
        return value;
      } catch {
        return JSON.stringify(value);
      }
    }
    return JSON.stringify([]);
  };

  return {
    empId: Number(input.empId),
    rules: safeStringify(input.rules.map(normalizeRule)),
    holidays: safeStringify(input.holidays || []),
    generalDays: safeStringify(input.generalDays || []),
    replaceDays: safeStringify(input.replaceDays || []),
    punchDocuments: safeStringify(input.punchDocuments || []),
    timeTables: safeStringify(
      input.timeTables.map((tt) => JSON.stringify(normalizeTimeTable(tt)))
    ),
    m_leaves: safeStringify(input.m_leaves.map((l) => JSON.stringify(l)) || []),
    mar_leaves: safeStringify(
      input.mar_leaves.map((l) => JSON.stringify(l)) || []
    ),
    p_leaves: safeStringify(input.p_leaves.map((l) => JSON.stringify(l)) || []),
    s_leaves: safeStringify(input.s_leaves.map((l) => JSON.stringify(l)) || []),
    c_leaves: safeStringify(input.c_leaves.map((l) => JSON.stringify(l)) || []),
    e_leaves: safeStringify(input.e_leaves.map((l) => JSON.stringify(l)) || []),
    w_leaves: safeStringify(input.w_leaves.map((l) => JSON.stringify(l)) || []),
    r_leaves: safeStringify(input.r_leaves.map((l) => JSON.stringify(l)) || []),
    o_leaves: safeStringify(input.o_leaves.map((l) => JSON.stringify(l)) || []),
  };
}

function finalJsonForUpdate(input, replacements = {}) {
  // Deep copy to avoid mutation
  const dataCopy = JSON.parse(JSON.stringify(input));

  // Replace objects in arrays or full array
  for (const key of Object.keys(replacements)) {
    const replacement = replacements[key];

    if (Array.isArray(dataCopy[key])) {
      if (Array.isArray(replacement)) {
        // Full array replacement
        dataCopy[key] = replacement;
      } else if (replacement.filter && replacement.newValue) {
        // Replace individual objects based on filter
        const existingMatches = dataCopy[key].some(replacement.filter);

        if (existingMatches) {
          dataCopy[key] = dataCopy[key].map((obj) =>
            replacement.filter(obj) ? { ...obj, ...replacement.newValue } : obj
          );
        } else {
          // ✅ Add new rule if not found
          dataCopy[key].push(replacement.newValue);
        }
      }
    } else {
      // Handle scalar value replacements (like empId, strings, numbers, etc.)
      dataCopy[key] = replacement;
    }
  }

  // Generate final JSON
  return generateEmployeeDataJSON(dataCopy);
}

export default finalJsonForUpdate;
