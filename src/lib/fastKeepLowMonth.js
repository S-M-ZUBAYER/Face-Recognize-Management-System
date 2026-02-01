function fastKeepLowMonth(data) {
  if (!data.length) return data;

  // 1. First quick loop → detect lowest year & month
  let lowYear = Infinity;
  let lowMonth = Infinity;

  for (const item of data) {
    const d = new Date(item.date);
    const y = d.getFullYear();
    const m = d.getMonth();

    if (y < lowYear) {
      lowYear = y;
      lowMonth = m;
    } else if (y === lowYear && m < lowMonth) {
      lowMonth = m;
    }
  }

  // 2. Second loop → keep only items matching lowest year & month
  return data.filter((item) => {
    const d = new Date(item.date);
    const isSameYearMonth =
      d.getFullYear() === lowYear && d.getMonth() === lowMonth;

    if (!isSameYearMonth) return false;

    // ➤ Remove if punches exist AND all values are "00:00"
    if (Array.isArray(item.punches)) {
      const allZero = item.punches.every((p) => p === "00:00");
      if (allZero) return false;
    }

    return true;
  });
}

export default fastKeepLowMonth;
