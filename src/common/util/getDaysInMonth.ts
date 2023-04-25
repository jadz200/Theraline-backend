export function getDaysInMonth(year: number, month: number): number[] {
  const daysInMonth: number[] = [];
  const numDays = new Date(year, month, 0).getDate();

  for (let i = 1; i <= numDays; i += 1) {
    daysInMonth.push(i);
  }

  return daysInMonth;
}
