/** 한 칸: 실제 날짜 + “지금 보고 있는 달”에 속하는지 */
export type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
};

/**
 * 해당 달 1일이 속한 주의 **월요일**부터 6주(42칸).
 * `Date#getDay()`는 0=일 … 6=토 → 월요일 시작이려면 `(getDay() + 6) % 7`일 칸을 비움.
 */
export function getCalendarCells(year: number, monthIndex: number): CalendarCell[] {
  const first = new Date(year, monthIndex, 1);
  const pad = (first.getDay() + 6) % 7;
  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, monthIndex, 1 - pad + i);
    cells.push({
      date: d,
      inCurrentMonth: d.getMonth() === monthIndex,
    });
  }
  return cells;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(monthStart: Date, delta: number): Date {
  return new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1);
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
