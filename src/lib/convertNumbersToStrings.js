function convertNumbersToStrings(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertNumbersToStrings);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => {
        // ✅ Keep employeeId as number
        if (k === "employeeId") {
          return [k, Number(v) || 0];
        }

        // ✅ Convert otherSalary array to JSON string
        if (k === "otherSalary" && Array.isArray(v)) {
          const convertedArr = v.map((item) =>
            Object.fromEntries(
              Object.entries(item).map(([ik, iv]) => [
                ik,
                typeof iv === "number" || typeof iv === "boolean"
                  ? iv.toString()
                  : iv,
              ])
            )
          );
          return [k, JSON.stringify(convertedArr)];
        }

        // ✅ Recursively process objects and arrays
        if (typeof v === "object" && v !== null) {
          return [k, convertNumbersToStrings(v)];
        }

        // ✅ Convert numbers and booleans to strings
        if (typeof v === "number" || typeof v === "boolean") {
          return [k, v.toString()];
        }

        return [k, v];
      })
    );
  }
  return obj;
}

export default convertNumbersToStrings;
