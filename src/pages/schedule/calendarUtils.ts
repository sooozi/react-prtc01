// 한 칸: 실제 날짜 + “지금 보고 있는 달”에 속하는지 
export type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
};

/** 그리드 첫 칸 요일 — “월 시작” 또는 “일 시작” */
export type CalendarWeekStart = "monday" | "sunday";

/**
 * 해당 달을 감싸는 연속 주 6줄 × 7칸(42칸)
 * `weekStart`가 `monday`면 첫 열은 월, `sunday`면 첫 열은 일
 * 월·연 경계는 자바스크립트 `Date`가 그레고리력으로 처리
 */
export function getCalendarCells(
  year: number,
  monthIndex: number,
  weekStart: CalendarWeekStart = "monday"
): CalendarCell[] {
  const first = new Date(year, monthIndex, 1);
  const dow = first.getDay(); // 일=0 … 토=6
  /** 1일 이전으로 몇 칸 돌아가야 “이번 줄의 첫 요일”에 맞는지 */
  const pad =
    weekStart === "monday"
      ? (dow + 6) % 7 /* 월=0 … 일=6 */
      : dow; /* 일=0 시작 */
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

// 해당 달 1일로 시작하는 날짜 반환
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// 해당 달 1일로 시작하는 날짜에 월 증가 또는 감소
export function addMonths(monthStart: Date, delta: number): Date {
  return new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1);
}

// 두 날짜가 같은 날짜인지 확인
export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
