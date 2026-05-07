import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  addMonths,
  getCalendarCells,
  isSameCalendarDay,
  startOfMonth,
  type CalendarWeekStart,
} from "./calendarUtils";
import "./MonthCalendar.scss";

// 그리드 열 순서는 weekStart 에 맞출 것 — 월 시작 / 일 시작
const WEEKDAYS_ORDER: Record<CalendarWeekStart, readonly string[]> = {
  monday: ["월", "화", "수", "목", "금", "토", "일"],
  sunday: ["일", "월", "화", "수", "목", "금", "토"],
};
// 월 번호
const MONTH_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

// 부모에서 넘기는 값
type Props = {
  month: Date; // 표시할 달
  onMonthChange: (nextMonthStart: Date) => void; // 달 바꿀 때 호출
};

export default function MonthCalendar({ month, onMonthChange }: Props) {
  const [weekStart, setWeekStart] = useState<CalendarWeekStart>("monday");

  const monthStart = useMemo(() => startOfMonth(month), [month]); // 지금 보는 달의 1일
  const y = monthStart.getFullYear(); // 년
  const m = monthStart.getMonth(); // 월
  const cells = useMemo(() => getCalendarCells(y, m, weekStart), [y, m, weekStart]); // 달력 그리드
  const title = useMemo( // 달력 제목
    () =>
      new Date(y, m, 1).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
      }),
    [y, m]
  );

  // 오늘 날짜
  const today = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  // 오늘 날짜가 있는 달인지 확인
  const isViewingTodayMonth =
    today.getFullYear() === y && today.getMonth() === m;

  return (
    <div className="month-calendar" role="region" aria-label="월 달력">
      {/* 월 번호 */}
      <div className="month-calendar__month-bar" role="toolbar" aria-label="월·오늘로 이동">
        {MONTH_NUMS.map((num) => {
          const monthIndex = num - 1;
          const isActive = m === monthIndex;
          return (
            <button
              key={num}
              type="button"
              className={clsx("month-calendar__nav-chip", {
                "month-calendar__nav-chip--active": isActive,
              })}
              onClick={() => onMonthChange(new Date(y, monthIndex, 1))}
              aria-pressed={isActive}
              aria-label={`${num}월`}
            >
              {num}
            </button>
          );
        })}
        {/* 오늘 날짜 */}
        <button
          type="button"
          className={clsx("month-calendar__nav-chip", "month-calendar__nav-chip--today", {
            "month-calendar__nav-chip--active": isViewingTodayMonth,
          })}
          onClick={() => onMonthChange(startOfMonth(new Date()))}
          aria-pressed={isViewingTodayMonth}
          aria-label="오늘 날짜가 있는 달로 이동"
        >
          오늘
        </button>
      </div>

      {/* 주 시작 */}
      <div className="month-calendar__week-start-row">
        <div
          className="month-calendar__week-start-switch-wrap"
          role="group"
          aria-label="주 시작"
        >
          <button
            type="button"
            className="month-calendar__week-start-switch"
            role="switch"
            aria-checked={weekStart === "sunday"}
            aria-label={
              weekStart === "monday"
                ? "월요일 시작. 누르면 일요일 시작으로 바뀝니다."
                : "일요일 시작. 누르면 월요일 시작으로 바뀝니다."
            }
            onClick={() => {
              setWeekStart((prev) => (prev === "monday" ? "sunday" : "monday"));
            }}
          >
            <span
              className={clsx("month-calendar__week-start-switch-track", {
                "month-calendar__week-start-switch-track--sunday": weekStart === "sunday",
              })}
            >
              <span
                className={clsx("month-calendar__week-start-switch-thumb", {
                  "month-calendar__week-start-switch-thumb--right": weekStart === "sunday",
                })}
                aria-hidden
              />
              <span className="month-calendar__week-start-switch-labels" aria-hidden>
                <span
                  className={clsx("month-calendar__week-start-switch-text", {
                    "month-calendar__week-start-switch-text--active": weekStart === "monday",
                  })}
                >
                  월요일
                </span>
                <span
                  className={clsx("month-calendar__week-start-switch-text", {
                    "month-calendar__week-start-switch-text--active": weekStart === "sunday",
                  })}
                >
                  일요일
                </span>
              </span>
            </span>
          </button>
        </div>
      </div>

      <header className="month-calendar__toolbar">
        <button
          type="button"
          className="month-calendar__round-nav"
          onClick={() => onMonthChange(addMonths(monthStart, -1))}
          aria-label="이전 달"
        >
          <span className="month-calendar__round-nav-icon" aria-hidden>
            ‹
          </span>
        </button>
        <h2 className="month-calendar__title">{title}</h2>
        <button
          type="button"
          className="month-calendar__round-nav"
          onClick={() => onMonthChange(addMonths(monthStart, 1))}
          aria-label="다음 달"
        >
          <span className="month-calendar__round-nav-icon" aria-hidden>
            ›
          </span>
        </button>
      </header>

      {/* 달력 그리드 */}
      <div className="month-calendar__grid" role="grid" aria-label={`${title} 달력`}>
        {/* 요일 */}
        {WEEKDAYS_ORDER[weekStart].map((label) => (
          <div key={label} className="month-calendar__weekday" role="columnheader">
            {label}
          </div>
        ))}
        {/* 날짜 */}
        {cells.map((cell) => {
          const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
          const isToday = isSameCalendarDay(cell.date, today);
          const dow = cell.date.getDay();
          const isSaturday = dow === 6;
          const isSunday = dow === 0;
          return (
            <div
              key={key}
              role="gridcell"
              tabIndex={-1}
              className={clsx("month-calendar__cell", {
                "month-calendar__cell--muted": !cell.inCurrentMonth,
                "month-calendar__cell--today": isToday,
              })}
              aria-current={isToday ? "date" : undefined}
            >
              <span
                className={clsx("month-calendar__day-num", {
                  "month-calendar__day-num--sat": isSaturday,
                  "month-calendar__day-num--sun": isSunday,
                })}
              >
                {cell.date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
