import { useLayoutEffect, useRef, useState } from "react";
import { Button, PageHeader } from "@/components";
import { useFloatingLayer } from "@/hooks/useFloatingLayer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ScheduleItem } from "@/lib/schedule/scheduleItems";
import MonthCalendar from "@/pages/schedule/components/calendar/MonthCalendar";
import SidePanel from "@/pages/schedule/components/side-panel/SidePanel";
import { startOfMonth } from "@/lib/schedule/calendarUtils";
import "@/pages/schedule/Schedule.scss";

export default function Schedule() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const isNarrowWorkspace = useMediaQuery("(max-width: 1024px)");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null); // 선택된 이벤트
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // 선택된 날짜
  const narrowPanelRef = useRef<HTMLDivElement>(null); // 좁은 화면 패널 참조

  // 이벤트 선택 시 모바일 패널 열기
  const handleEventSelect = (item: ScheduleItem) => {
    setSelectedEvent(item);
    setSelectedDate(item.date);
    if (isNarrowWorkspace) {
      setMobilePanelOpen(true);
    }
  };

  // 날짜 선택 시 등록 모드로 전환
  const handleDateSelect = (date: string) => {
    setSelectedEvent(null);
    setSelectedDate(date);
    if (isNarrowWorkspace) {
      setMobilePanelOpen(true);
    }
  };

  // 생성 패널 열기
  const handleOpenCreatePanel = () => {
    setSelectedEvent(null);
    setSelectedDate(null);
    setMobilePanelOpen(true);
  };

  // 좁은 화면일 때 모바일 패널 닫기
  useLayoutEffect(() => {
    if (!isNarrowWorkspace) {
      queueMicrotask(() => setMobilePanelOpen(false));
    }
  }, [isNarrowWorkspace]);

  // 모바일 패널 포커스 관리
  useFloatingLayer({
    open: mobilePanelOpen && isNarrowWorkspace,
    enabled: true,
    layerRootRef: narrowPanelRef,
    onEscape: () => setMobilePanelOpen(false),
    lockScroll: true,
    trapTab: true,
    focusInitial: "first-tabbable",
    restoreFocusMode: "previous",
  });

  return (
    <div className="schedule-page">
      <PageHeader badge="📅 Schedule" title="일정" />

      <div className="schedule-layout">
        {isNarrowWorkspace ? (
          <div className="schedule-layout__fab-row">
            <Button type="button" variant="secondary" size="sm" onClick={handleOpenCreatePanel}>
              일정 입력
            </Button>
          </div>
        ) : null}
        <div
          className={`schedule-workspace${isNarrowWorkspace && mobilePanelOpen ? " schedule-workspace--narrow-sheet-open" : ""}`}
        >
          {/* 왼쪽 달력 영역 */}
          <div className="schedule-workspace__calendar">
            <MonthCalendar
              month={month}
              onMonthChange={setMonth}
              selectedEventId={selectedEvent?.id ?? null}
              selectedDate={selectedDate ?? null} // "2026-06-20" 형식의 날짜
              onEventSelect={handleEventSelect}
              onDateSelect={handleDateSelect} // "2026-06-20" 형식의 날짜
            />
          </div>

          {/* 좁은 화면일 때 패널 닫기 */}
          {isNarrowWorkspace && mobilePanelOpen ? (
            <button
              type="button"
              className="schedule-workspace__sheet-scrim"
              aria-label="패널 닫기"
              onClick={() => setMobilePanelOpen(false)}
            />
          ) : null}

          {/* 오른쪽 패널: 넓은 화면은 항상 표시, 좁은 화면(≤1024px)은 바텀 시트 */}
          <div
            ref={narrowPanelRef}
            className={`schedule-workspace__panel${isNarrowWorkspace ? " schedule-workspace__panel--narrow" : ""}${isNarrowWorkspace && mobilePanelOpen ? " schedule-workspace__panel--narrow-open" : ""}${isNarrowWorkspace && !mobilePanelOpen ? " schedule-workspace__panel--narrow-collapsed" : ""}`} // 좁은 화면: 열림/닫힘에 따라 시트 슬라이드·숨김
            role={isNarrowWorkspace && mobilePanelOpen ? "dialog" : undefined} // 좁은 화면 + 열림: 스크린 리더에 dialog
            aria-modal={isNarrowWorkspace && mobilePanelOpen ? true : undefined} // 열린 시트를 모달로 안내(뒤 달력은 보조 레이어)
            aria-labelledby={
              isNarrowWorkspace && mobilePanelOpen ? "schedule-side-panel-title" : undefined
            } // SidePanel h2(id)와 dialog 이름 연결
            tabIndex={isNarrowWorkspace && mobilePanelOpen ? -1 : undefined} // 열릴 때 포커스 트랩 루트(useFloatingLayer)
            inert={isNarrowWorkspace && !mobilePanelOpen ? true : undefined} // 닫힌 시트: 패널 안 Tab·클릭 차단
          >
            <SidePanel
              key={selectedEvent?.id ?? selectedDate ?? "create"}
              editingItem={selectedEvent}
              selectedDate={selectedDate}
              onClearSelection={() => {
                setSelectedEvent(null);
                setSelectedDate(null);
              }}
              onUpdated={(item) => setSelectedEvent(item)}
              onClose={isNarrowWorkspace ? () => setMobilePanelOpen(false) : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
