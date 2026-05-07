import { useEffect, useMemo, useRef, useState } from "react";
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
  const [isMonthPopoverOpen, setIsMonthPopoverOpen] = useState(false);
  const titleBtnRef = useRef<HTMLButtonElement | null>(null);
  const monthPopoverRef = useRef<HTMLDivElement | null>(null);

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

  const isViewingTodayMonth = today.getFullYear() === y && today.getMonth() === m;

  // 월 선택 팝오버 닫기
  useEffect(() => {
    if (!isMonthPopoverOpen) return; // 팝오버가 열려있지 않으면 리턴

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMonthPopoverOpen(false); // Esc 키 누르면 팝오버 닫기
    }

    function handlePointerDown(e: PointerEvent) {
      const t = e.target as Node | null;
      if (!t) return; // 타겟이 없으면 리턴
      if (titleBtnRef.current?.contains(t)) return; // 타이틀 버튼이 타겟을 포함하고 있으면 리턴
      if (monthPopoverRef.current?.contains(t)) return; // 팝오버가 타겟을 포함하고 있으면 리턴
      setIsMonthPopoverOpen(false); // 팝오버 닫기
    }

    window.addEventListener("keydown", handleKeyDown); // Esc 키 누르면 팝오버 닫기
    window.addEventListener("pointerdown", handlePointerDown, { passive: true }); // 팝오버 외 영역 클릭 시 팝오버 닫기
    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Esc 키 누르면 팝오버 닫기
      window.removeEventListener("pointerdown", handlePointerDown); // 팝오버 외 영역 클릭 시 팝오버 닫기
    };
  }, [isMonthPopoverOpen]);

  return (
    <div className="month-calendar" role="region" aria-label="월 달력">
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

        <button
          type="button"
          className="month-calendar__today-btn"
          onClick={() => {
            onMonthChange(startOfMonth(new Date()));
            setIsMonthPopoverOpen(false);
          }}
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
        <h2 className="month-calendar__title">
          <button
            type="button"
            ref={titleBtnRef}
            className="month-calendar__title-trigger"
            aria-haspopup="listbox"
            aria-expanded={isMonthPopoverOpen}
            aria-controls="month-calendar-month-picker"
            onClick={() => setIsMonthPopoverOpen((prev) => !prev)}
          >
            <span className="month-calendar__title-text">{title}</span>
            <span className="month-calendar__title-caret" aria-hidden>
              ▾
            </span>
          </button>

          {/* 월 선택 팝오버 */}
          <div
            id="month-calendar-month-picker"
            ref={monthPopoverRef}
            className="month-calendar__month-popover"
            role="listbox"
            aria-label="월 선택"
            hidden={!isMonthPopoverOpen}
          >
            {MONTH_NUMS.map((num) => (
              <button
                key={num}
                type="button"
                className="month-calendar__month-option"
                role="option"
                aria-selected={m === num - 1}
                onClick={() => {
                  onMonthChange(new Date(y, num - 1, 1));
                  setIsMonthPopoverOpen(false);
                }}
              >
                {num}월
              </button>
            ))}
          </div>
        </h2>
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
