import { useMemo } from "react";
import clsx from "clsx";
import { addMonths, getCalendarCells, isSameCalendarDay, startOfMonth } from "./calendarUtils";
import "./MonthCalendar.scss";

const WEEKDAYS_KO = ["월", "화", "수", "목", "금", "토", "일"];
const MONTH_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

type Props = {
  /** 표시할 달의 아무 날짜(보통 1일) */
  month: Date;
  onMonthChange: (nextMonthStart: Date) => void;
};

export default function MonthCalendar({ month, onMonthChange }: Props) {
  const monthStart = useMemo(() => startOfMonth(month), [month]);
  const y = monthStart.getFullYear();
  const m = monthStart.getMonth();
  const cells = useMemo(() => getCalendarCells(y, m), [y, m]);
  const title = useMemo(
    () =>
      new Date(y, m, 1).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
      }),
    [y, m]
  );

  const today = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  const isViewingTodayMonth =
    today.getFullYear() === y && today.getMonth() === m;

  return (
    <div className="month-calendar">
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

      <div className="month-calendar__grid" role="grid" aria-label={`${title} 달력`}>
        {WEEKDAYS_KO.map((label) => (
          <div key={label} className="month-calendar__weekday" role="columnheader">
            {label}
          </div>
        ))}
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
