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
    return d.getFullYear() === highYear && d.getMonth() === highMonth;
  });
}

export default fastKeepHighMonth;
