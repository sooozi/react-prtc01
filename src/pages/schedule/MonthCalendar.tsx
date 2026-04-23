import { useMemo } from "react";
import clsx from "clsx";
import { Button } from "@/components";
import { addMonths, getCalendarCells, isSameCalendarDay, startOfMonth } from "./calendarUtils";
import "./MonthCalendar.scss";

const WEEKDAYS_KO = ["월", "화", "수", "목", "금", "토", "일"];

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

  return (
    <div className="month-calendar">
      <header className="month-calendar__toolbar">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onMonthChange(addMonths(monthStart, -1))}
          aria-label="이전 달"
        >
          ‹
        </Button>
        <h2 className="month-calendar__title">{title}</h2>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onMonthChange(addMonths(monthStart, 1))}
          aria-label="다음 달"
        >
          ›
        </Button>
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
              <span className="month-calendar__day-num">{cell.date.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
