import { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  addMonths,
  getCalendarCells,
  isSameCalendarDay,
  startOfMonth,
  type CalendarWeekStart,
} from "./calendarUtils";
import { CalendarPickerPopover, CalendarPopoverOption } from "./CalendarPickerPopover";
import "./MonthCalendar.scss";

// 그리드 열 순서는 weekStart 에 맞출 것 — 월 시작 / 일 시작
const WEEKDAYS_ORDER: Record<CalendarWeekStart, readonly string[]> = {
  monday: ["월", "화", "수", "목", "금", "토", "일"],
  sunday: ["일", "월", "화", "수", "목", "금", "토"],
};

const MONTH_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

// 부모에서 넘기는 값
type Props = {
  month: Date; // 표시할 달
  onMonthChange: (nextMonthStart: Date) => void; // 달 바꿀 때 호출
};

export default function MonthCalendar({ month, onMonthChange }: Props) {
  const [weekStart, setWeekStart] = useState<CalendarWeekStart>("monday");
  const [isMonthPopoverOpen, setIsMonthPopoverOpen] = useState(false); // 월 선택 팝오버 열려있는지 확인
  const [isYearPopoverOpen, setIsYearPopoverOpen] = useState(false); // 연도 선택 팝오버 열려있는지 확인
  const yearBtnRef = useRef<HTMLButtonElement | null>(null); // 연도 트리거 버튼
  const titleBtnRef = useRef<HTMLButtonElement | null>(null); // 월 트리거 버튼
  const monthPopoverRef = useRef<HTMLDivElement | null>(null); // 월 팝오버
  const yearPopoverRef = useRef<HTMLDivElement | null>(null); // 연도 팝오버

  const monthStart = useMemo(() => startOfMonth(month), [month]); // 지금 보는 달의 1일
  const y = monthStart.getFullYear(); // 년
  const m = monthStart.getMonth(); // 월
  const cells = useMemo(() => getCalendarCells(y, m, weekStart), [y, m, weekStart]); // 달력 그리드
  const yearLabel = `${y}년`;
  const monthLabel = `${m + 1}월`;

  // 보고 있는 해를 중심으로 앞뒤 범위
  const yearOptions = useMemo(() => {
    const span = 10;
    return Array.from({ length: span * 2 + 1 }, (_, i) => y - span + i);
  }, [y]);

  // 오늘 날짜
  const today = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  // 오늘 날짜가 있는 달인지 확인
  const isViewingTodayMonth = today.getFullYear() === y && today.getMonth() === m;

  return (
    <div className="month-calendar">
      {/* 주 시작 */}
      <div className="month-calendar__week-start-row">
        <div className="month-calendar__week-start-switch-wrap">
          <button
            type="button"
            className="month-calendar__week-start-switch"
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
              />
              <span className="month-calendar__week-start-switch-labels">
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
          className={clsx("month-calendar__today-btn", isViewingTodayMonth && "month-calendar__today-btn--active")}
          onClick={() => {
            onMonthChange(startOfMonth(new Date()));
            setIsMonthPopoverOpen(false);
            setIsYearPopoverOpen(false);
          }}
        >
          오늘
        </button>
      </div>

      {/* 헤더 */}
      <header className="month-calendar__toolbar">
        {/* 이전 달 */}
        <button
          type="button"
          className="month-calendar__round-nav"
          onClick={() => {
            onMonthChange(addMonths(monthStart, -1));
            setIsMonthPopoverOpen(false);
            setIsYearPopoverOpen(false);
          }}
        >
          <span className="month-calendar__round-nav-icon">
            ‹
          </span>
        </button>
        
        {/* 연·월 컨트롤 */}
        <div className="month-calendar__title">
          {/* 연도 선택 */}
          <CalendarPickerPopover
            buttonRef={yearBtnRef}
            popoverRef={yearPopoverRef}
            popoverId="month-calendar-year-picker"
            isOpen={isYearPopoverOpen}
            onDismiss={() => setIsYearPopoverOpen(false)}
            onTriggerClick={() => {
              setIsMonthPopoverOpen(false);
              setIsYearPopoverOpen((prev) => !prev);
            }}
            triggerClassName="month-calendar__title-year-trigger"
            popoverExtraClassName="month-calendar__year-popover"
            triggerDisplay={<span className="month-calendar__title-year">{yearLabel}</span>}
          >
            {yearOptions.map((yearNum) => (
              <CalendarPopoverOption
                key={yearNum} // 연도 번호
                selected={y === yearNum} // 선택된 연도인지 확인
                onSelect={() => {
                  onMonthChange(new Date(yearNum, m, 1));
                  setIsYearPopoverOpen(false); // 연도 팝오버 닫기
                }}
              >
                {yearNum}년
              </CalendarPopoverOption>
            ))}
          </CalendarPickerPopover>

          {/* 월 선택 */}
          <CalendarPickerPopover
            buttonRef={titleBtnRef}
            popoverRef={monthPopoverRef}
            popoverId="month-calendar-month-picker"
            isOpen={isMonthPopoverOpen}
            onDismiss={() => setIsMonthPopoverOpen(false)}
            onTriggerClick={() => {
              setIsYearPopoverOpen(false);
              setIsMonthPopoverOpen((prev) => !prev);
            }}
            triggerClassName="month-calendar__title-trigger"
            triggerDisplay={
              <span className="month-calendar__title-text">
                <span className="month-calendar__title-month">{monthLabel}</span>
              </span>
            }
          >
            {MONTH_NUMS.map((num) => (
              <CalendarPopoverOption
                key={num} // 월 번호
                selected={m === num - 1} // 선택된 월인지 확인
                onSelect={() => {
                  onMonthChange(new Date(y, num - 1, 1));
                  setIsMonthPopoverOpen(false); // 월 팝오버 닫기
                }}
              >
                {num}월
              </CalendarPopoverOption>
            ))}
          </CalendarPickerPopover>
        </div>

        <button
          type="button"
          className="month-calendar__round-nav"
          onClick={() => {
            onMonthChange(addMonths(monthStart, 1));
            setIsMonthPopoverOpen(false);
            setIsYearPopoverOpen(false);
          }}
        >
          <span className="month-calendar__round-nav-icon">
            ›
          </span>
        </button>
      </header>

      {/* 달력 그리드 */}
      <div className="month-calendar__grid">
        {/* 요일 */}
        {WEEKDAYS_ORDER[weekStart].map((label) => (
          <div key={label} className="month-calendar__weekday">
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
              className={clsx("month-calendar__cell", {
                "month-calendar__cell--muted": !cell.inCurrentMonth,
                "month-calendar__cell--today": isToday,
              })}
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
