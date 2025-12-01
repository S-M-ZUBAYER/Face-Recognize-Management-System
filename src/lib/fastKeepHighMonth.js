function fastKeepHighMonth(data) {
  if (!data.length) return data;

  // 1. First quick loop → detect highest year & month
  let highYear = -Infinity;
  let highMonth = -Infinity;

  for (const item of data) {
    const d = new Date(item.date);
    const y = d.getFullYear();
    const m = d.getMonth();

    if (y > highYear) {
      highYear = y;
      highMonth = m;
    } else if (y === highYear && m > highMonth) {
      highMonth = m;
    }
  }

  // 2. Second loop → keep only items matching highest year & month
  return data.filter((item) => {
    const d = new Date(item.date);
    const isSameYearMonth =
      d.getFullYear() === highYear && d.getMonth() === highMonth;

    if (!isSameYearMonth) return false;

    // ➤ Remove if punches exist AND all values are "00:00"
    if (Array.isArray(item.punches)) {
      const allZero = item.punches.every((p) => p === "00:00");
      if (allZero) return false;
    }

    return true;
  });
}

export default fastKeepHighMonth;
