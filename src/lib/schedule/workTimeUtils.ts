// 퇴근 시각 계산에 쓰는 근무 시간(시)
export const DEFAULT_WORK_HOURS = 9;

const ANCHOR = new Date(2024, 5, 12, 0, 0, 0, 0);

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** 오전 9:00 미만(당일 0:00~8:59)이면 퇴근은 항상 18:00(당일). */
const CUTOFF_MINUTES = 9 * 60;
const FIXED_EARLY_LEAVE = { time: "18:00", nextDay: false as const };

/**
 * `HH:mm` 출근 시각에 `workHours`를 더한 퇴근 시각.
 * 출근이 오전 9시 **이전**이면 퇴근은 `18:00`(익일 아님).
 * 그 외에는 `workHours`만큼 더하고, 날짜가 넘어가면 `nextDay`가 true.
 */
export function computeClockOut(
  clockInHHmm: string,
  workHours: number = DEFAULT_WORK_HOURS
): { time: string; nextDay: boolean } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(clockInHHmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(min) || h > 23 || h < 0 || min > 59 || min < 0) {
    return null;
  }

  const clockInMinutes = h * 60 + min;
  if (clockInMinutes < CUTOFF_MINUTES) {
    return { ...FIXED_EARLY_LEAVE };
  }

  const base = new Date(ANCHOR);
  base.setHours(h, min, 0, 0);
  const out = new Date(base.getTime() + workHours * 60 * 60 * 1000);
  const nextDay = out.getDate() !== base.getDate() || out.getMonth() !== base.getMonth();
  return { time: `${pad2(out.getHours())}:${pad2(out.getMinutes())}`, nextDay };
}

/** `HH:mm` 또는 `H:mm` → `HH:mm`, 유효하지 않으면 `null` */
export function normalizeTimeHHmm(s: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(min) || h > 23 || h < 0 || min > 59 || min < 0) {
    return null;
  }
  return `${pad2(h)}:${pad2(min)}`;
}
