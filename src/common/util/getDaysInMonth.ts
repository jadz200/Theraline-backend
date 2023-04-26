export function getDaysInMonth(year: number, month: number): string[] {
  const daysInMonth: string[] = [];
  const numDays = new Date(year, month, 0).getDate();

  for (let i = 1; i <= numDays; i += 1) {
    daysInMonth.push(`Day ${i}`);
  }

  return daysInMonth;
}
