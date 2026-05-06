import { useState } from "react";
import { Badge } from "@/components";
import MonthCalendar from "@/pages/schedule/MonthCalendar";
import ScheduleSidePanel from "@/pages/schedule/ScheduleSidePanel";
import { startOfMonth } from "@/pages/schedule/calendarUtils";
import "@/pages/schedule/Schedule.scss";

export default function Schedule() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  return (
    <div className="schedule-page">
      <div className="list-page-head">
        <div className="title-block">
          <Badge>📅 Schedule</Badge>
          <h1 className="title">일정</h1>
        </div>
      </div>

      <div className="schedule-layout">
        <div className="schedule-workspace">
          <section className="schedule-workspace__calendar" aria-label="월 달력">
            <MonthCalendar month={month} onMonthChange={setMonth} />
          </section>
          <div className="schedule-workspace__panel">
            <ScheduleSidePanel />
          </div>
        </div>
      </div>
    </div>
  );
}
