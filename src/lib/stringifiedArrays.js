export const stringifiedArrays = (array) => {
  if (!Array.isArray(array)) {
    console.error("stringifiedArrays: Input is not an array", array);
    return [];
  }

  const normalizedData = array.map((item, index) => {
    try {
      // Check if item has salaryRules property
      if (!item.salaryRules) {
        console.warn(`Item ${index} has no salaryRules property:`, item);
        return item;
      }

      // First parse - handle both string and object cases
      let parsed;
      if (typeof item.salaryRules === "string") {
        try {
          parsed = JSON.parse(item.salaryRules);
        } catch (parseError) {
          console.error(
            `Failed to parse salaryRules for item ${index}:`,
            parseError
          );
          return item;
        }
      } else if (typeof item.salaryRules === "object") {
        parsed = item.salaryRules;
      } else {
        console.warn(
          `salaryRules for item ${index} is neither string nor object:`,
          typeof item.salaryRules
        );
        return item;
      }

      // Helper function to safely parse nested JSON
      const safeParse = (value, fieldName) => {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch (error) {
            console.warn(
              `Failed to parse ${fieldName} for item ${index}:`,
              error
            );
            return value;
          }
        }
        return value;
      };

      return {
        ...item,
        salaryRules: {
          ...parsed,
          rules: safeParse(parsed.rules, "rules"),
          holidays: safeParse(parsed.holidays, "holidays"),
          generalDays: safeParse(parsed.generalDays, "generalDays"),
          replaceDays: safeParse(parsed.replaceDays, "replaceDays"),
        },
      };
    } catch (error) {
      console.error(`Error processing item ${index}:`, error, item);
      return item;
    }
  });

  return normalizedData;
};
