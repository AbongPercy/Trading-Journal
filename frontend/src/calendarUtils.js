// Calendar math shared by the Month view (big calendar)
// and the Year view (mini month cards).

/** "8" -> "08" */
export function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Builds the list of day cells for a month (month is 1-12).
 * Returns null for leading blanks (before the 1st) and trailing blanks
 * (after the last day), so the grid always forms full weeks of 7.
 */
export function buildMonthCells(year, month) {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // getDay(): 0 = Sunday ... 6 = Saturday
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      dateNum: day,
      dateString: `${year}-${pad(month)}-${pad(day)}`,
    });
  }

  // Pad the end so the last row is a complete week of 7
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}
