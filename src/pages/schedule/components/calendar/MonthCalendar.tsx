import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  addMonths,
  getCalendarCells,
  isSameCalendarDay,
  startOfMonth,
  type CalendarWeekStart,
} from "@/lib/schedule/calendarUtils";
import { CalendarPickerPopover, CalendarPopoverOption } from "@/pages/schedule/components/calendar/CalendarPickerPopover";
import { getKrHolidayName } from "@/lib/holidayUtils";
import { Tooltip } from "@/components";
import "@/pages/schedule/components/calendar/MonthCalendar.scss";

const STORAGE_KEY = "scheduleItems";
const SCHEDULE_ITEMS_UPDATED_EVENT = "schedule-items-updated";

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

type ScheduleDraftItem = {
  id: string;
  category: "work" | "meeting" | "personal" | "other";
  categoryLabel?: string;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: number;
};

// 숫자를 두 자리 문자열로 변환하는 함수
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

// 날짜를 ISO 형식으로 변환하는 함수
function toISODateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// 로컬스토리지에서 일정 데이터를 읽어오는 함수
function safeReadScheduleItems(): ScheduleDraftItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ScheduleDraftItem[]) : [];
  } catch {
    return [];
  }
}

export default function MonthCalendar({ month, onMonthChange }: Props) {
  const [weekStart, setWeekStart] = useState<CalendarWeekStart>("monday");
  const [isMonthPopoverOpen, setIsMonthPopoverOpen] = useState(false); // 월 선택 팝오버 열려있는지 확인
  const [isYearPopoverOpen, setIsYearPopoverOpen] = useState(false); // 연도 선택 팝오버 열려있는지 확인
  const yearBtnRef = useRef<HTMLButtonElement | null>(null); // 연도 트리거 버튼
  const titleBtnRef = useRef<HTMLButtonElement | null>(null); // 월 트리거 버튼
  const monthPopoverRef = useRef<HTMLDivElement | null>(null); // 월 팝오버
  const yearPopoverRef = useRef<HTMLDivElement | null>(null); // 연도 팝오버
  const [scheduleItems, setScheduleItems] = useState<ScheduleDraftItem[]>([]);

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

  const weekStartSunday = weekStart === "sunday";
  const weekStartSwitchLabel = weekStartSunday
    ? "주 시작 요일, 일요일부터. 월요일부터로 바꾸려면 선택"
    : "주 시작 요일, 월요일부터. 일요일부터로 바꾸려면 선택";

  // 마운트 시 일정 데이터를 로컬스토리지에서 읽어오는 함수
  useEffect(() => {
    const sync = () => setScheduleItems(safeReadScheduleItems()); // 일정 데이터를 로컬스토리지에서 읽어오는 함수
    sync();

    // 로컬스토리지에 변경이 있을 때 일정 데이터를 다시 읽어오는 함수
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) sync();
    };
    // 일정 데이터가 업데이트될 때 일정 데이터를 다시 읽어오는 함수
    const onUpdated = () => sync();

    window.addEventListener("storage", onStorage); // 로컬스토리지에 변경이 있을 때 일정 데이터를 다시 읽어오는 함수
    window.addEventListener(SCHEDULE_ITEMS_UPDATED_EVENT, onUpdated); // 일정 데이터가 업데이트될 때 일정 데이터를 다시 읽어오는 함수

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SCHEDULE_ITEMS_UPDATED_EVENT, onUpdated);
    };
  }, []);

  // 일정 데이터를 날짜별로 그룹화하는 함수(모든 일정이 한 배열에 섞여 있으니까!)
  const scheduleByDate = useMemo(() => {
    const map = new Map<string, ScheduleDraftItem[]>(); // 일정 데이터를 날짜별로 그룹화하는 맵
    for (const it of scheduleItems) {
      if (!it?.date) continue; // 일정 데이터가 날짜가 없으면 건너뜀
      const list = map.get(it.date) ?? [];
      list.push(it); // 일정 데이터를 날짜별로 그룹화하는 맵에 추가
      map.set(it.date, list); // 일정 데이터를 날짜별로 그룹화하는 맵에 추가
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)); // 일정 데이터를 생성일시별로 정렬
      map.set(k, list); // 일정 데이터를 날짜별로 그룹화하는 맵에 추가
    }
    return map; // 일정 데이터를 날짜별로 그룹화하는 맵 반환
  }, [scheduleItems]);

  return (
    <div className="month-calendar">
      <h2 className="visually-hidden">달력</h2>
      {/* 주 시작 */}
      <div className="month-calendar__week-start-row">
        <div className="month-calendar__week-start-switch-wrap">
          <button
            type="button"
            className="month-calendar__week-start-switch"
            role="switch"
            aria-checked={weekStartSunday}
            aria-label={weekStartSwitchLabel}
            onClick={() => {
              setWeekStart((prev) => (prev === "monday" ? "sunday" : "monday"));
            }}
          >
            <span
              className={clsx("month-calendar__week-start-switch-track", {
                "month-calendar__week-start-switch-track--sunday": weekStartSunday,
              })}
              aria-hidden
            >
              <span
                className={clsx("month-calendar__week-start-switch-thumb", {
                  "month-calendar__week-start-switch-thumb--right": weekStartSunday,
                })}
              />
              <span className="month-calendar__week-start-switch-labels">
                <span
                  className={clsx("month-calendar__week-start-switch-text", {
                    "month-calendar__week-start-switch-text--active": !weekStartSunday,
                  })}
                >
                  월요일
                </span>
                <span
                  className={clsx("month-calendar__week-start-switch-text", {
                    "month-calendar__week-start-switch-text--active": weekStartSunday,
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
          aria-label="이전 달"
          onClick={() => {
            onMonthChange(addMonths(monthStart, -1));
            setIsMonthPopoverOpen(false);
            setIsYearPopoverOpen(false);
          }}
        >
          <span className="month-calendar__round-nav-icon" aria-hidden>
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
            listboxLabel="연도 선택"
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
            listboxLabel="월 선택"
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
          aria-label="다음 달"
          onClick={() => {
            onMonthChange(addMonths(monthStart, 1));
            setIsMonthPopoverOpen(false);
            setIsYearPopoverOpen(false);
          }}
        >
          <span className="month-calendar__round-nav-icon" aria-hidden>
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
          const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`; // 날짜 키 생성
          const isToday = isSameCalendarDay(cell.date, today);
          const dow = cell.date.getDay(); // 요일
          const isSaturday = dow === 6; // 토요일인지 확인
          const isSunday = dow === 0; // 일요일인지 확인
          const isoDate = toISODateLocal(cell.date); // 날짜를 ISO 형식으로 변환
          const dayItems = scheduleByDate.get(isoDate) ?? []; // 일정 데이터를 날짜별로 그룹화하는 맵에서 일정 데이터를 읽어옴
          const visibleItems = dayItems.slice(0, 4); // 일정 데이터를 4개까지 표시
          const overflow = Math.max(0, dayItems.length - visibleItems.length); // 일정 데이터를 4개까지 표시한 후 더 있는 일정 데이터 개수
          const holidayName = getKrHolidayName( // 공휴일 이름 가져오기
            cell.date.getFullYear(),
            cell.date.getMonth() + 1,
            cell.date.getDate()
          );
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
                  "month-calendar__day-num--holiday": Boolean(holidayName),
                })}
                title={holidayName ?? undefined}
              >
                {cell.date.getDate()}
              </span>
              {holidayName && cell.inCurrentMonth ? (
                <span className="month-calendar__holiday-name" aria-label={`공휴일: ${holidayName}`}>
                  {holidayName}
                </span>
              ) : null}

              {/* 일정 데이터 표시 */}
              {visibleItems.length > 0 ? (
                <div className="month-calendar__events" aria-label={`${isoDate} 일정`}>
                  {visibleItems.map((it) => (
                    <Tooltip
                      key={it.id}
                      content={it.note || "제목 없음"}
                      onlyWhenTruncated
                      fullWidth
                    >
                      <span
                        className={clsx("month-calendar__event", `month-calendar__event--${it.category}`)}
                      >
                        <span className="month-calendar__event-text" data-tooltip-truncate>
                          {it.note || "제목 없음"}
                        </span>
                      </span>
                    </Tooltip>
                  ))}
                  {/* 일정 데이터 초과 표시 */}
                  {overflow > 0 ? (
                    <div className="month-calendar__event month-calendar__event--overflow" aria-label={`일정 ${overflow}개 더 있음`}>
                      +{overflow}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
