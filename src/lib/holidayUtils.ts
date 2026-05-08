import { krHolidays } from "@/lib/krHolidays";

/** 달력 표시용 키 */
export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * (year, month, day)가 한국 공휴일이면 이름을 반환, 아니면 null
 */
export function getKrHolidayName(
  year: number,
  month: number,
  day: number
): string | null {
  // "정오"로 잡아서 시간대/서머타임 경계 이슈를 피하는 패턴
  const d = new Date(year, month - 1, day, 12, 0, 0);

  const hit = krHolidays.isHoliday(d);
  if (!hit) return null;

  // isHoliday는 보통 배열(해당 날짜의 휴일들)을 반환
  const first = Array.isArray(hit) ? hit[0] : hit;
  return first?.name ?? "Holiday";
}