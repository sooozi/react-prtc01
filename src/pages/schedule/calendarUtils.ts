// 한 칸: 실제 날짜 + “지금 보고 있는 달”에 속하는지 
export type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
};

/**
 * 해당 달 1일이 속한 주의 월요일부터 6주(42칸)
 * 월·연 경계는 자바스크립트 `Date`가 그레고리력으로 처리(윤년·달 길이 포함)
 */
export function getCalendarCells(year: number, monthIndex: number): CalendarCell[] {
  const first = new Date(year, monthIndex, 1); // 해당 달 1일로 시작하는 날짜
  const pad = (first.getDay() + 6) % 7; // [요일] JS 기본 요일 순서인 일~토를 월~일 순서로 바꾸는 공식
  const cells: CalendarCell[] = []; // 달력 칸 목록
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, monthIndex, 1 - pad + i); // 해당 달 1일로 시작하는 날짜에 월 증가 또는 감소 계산 
    cells.push({
      date: d, // 날짜
      inCurrentMonth: d.getMonth() === monthIndex, // 해당 달에 속하는지
    });
  }
  return cells; // 달력 칸 목록 반환
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
