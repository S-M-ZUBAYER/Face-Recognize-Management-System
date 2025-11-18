export const parseNormalData = (obj) => {
  if (typeof obj === "string") {
    try {
      // Keep parsing until it’s no longer JSON
      let parsed = JSON.parse(obj);
      return parseNormalData(parsed);
    } catch {
      return obj;
    }
  } else if (Array.isArray(obj)) {
    return obj.map((item) => parseNormalData(item));
  } else if (typeof obj === "object" && obj !== null) {
    const result = {};
    for (const key in obj) {
      result[key] = parseNormalData(obj[key]);
    }
    return result;
  }
  return obj;
};
