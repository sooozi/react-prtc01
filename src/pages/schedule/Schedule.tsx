import { useLayoutEffect, useRef, useState } from "react";
import { Button, PageHeader } from "@/components";
import { useFloatingLayer } from "@/hooks/useFloatingLayer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MonthCalendar from "@/pages/schedule/components/calendar/MonthCalendar";
import SidePanel from "@/pages/schedule/components/side-panel/SidePanel";
import { startOfMonth } from "@/lib/schedule/calendarUtils";
import "@/pages/schedule/Schedule.scss";

export default function Schedule() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const isNarrowWorkspace = useMediaQuery("(max-width: 1024px)");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const narrowPanelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isNarrowWorkspace) {
      queueMicrotask(() => setMobilePanelOpen(false));
    }
  }, [isNarrowWorkspace]);

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
        <div
          className={`schedule-workspace${isNarrowWorkspace && mobilePanelOpen ? " schedule-workspace--narrow-sheet-open" : ""}`}
        >
          {isNarrowWorkspace ? (
            <div className="schedule-workspace__fab-row">
              <Button type="button" variant="secondary" size="sm" onClick={() => setMobilePanelOpen(true)}>
                일정 입력
              </Button>
            </div>
          ) : null}
          <div className="schedule-workspace__calendar">
            <MonthCalendar month={month} onMonthChange={setMonth} />
          </div>

          {isNarrowWorkspace && mobilePanelOpen ? (
            <button
              type="button"
              className="schedule-workspace__sheet-scrim"
              aria-label="패널 닫기"
              onClick={() => setMobilePanelOpen(false)}
            />
          ) : null}

          <div
            ref={narrowPanelRef}
            className={`schedule-workspace__panel${isNarrowWorkspace ? " schedule-workspace__panel--narrow" : ""}${isNarrowWorkspace && mobilePanelOpen ? " schedule-workspace__panel--narrow-open" : ""}${isNarrowWorkspace && !mobilePanelOpen ? " schedule-workspace__panel--narrow-collapsed" : ""}`}
            role={isNarrowWorkspace && mobilePanelOpen ? "dialog" : undefined}
            aria-modal={isNarrowWorkspace && mobilePanelOpen ? true : undefined}
            aria-labelledby={isNarrowWorkspace && mobilePanelOpen ? "schedule-side-panel-title" : undefined}
            tabIndex={isNarrowWorkspace && mobilePanelOpen ? -1 : undefined}
            inert={isNarrowWorkspace && !mobilePanelOpen ? true : undefined}
          >
            <SidePanel
              onClose={
                isNarrowWorkspace ? () => setMobilePanelOpen(false) : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
