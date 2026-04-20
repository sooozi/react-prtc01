import { Badge } from "@/components";
import "@/pages/schedule/Schedule.scss";

export default function Schedule() {
  return (
    <div className="schedule-page">
      <div className="list-page-head">
        <div className="title-block">
          <Badge>📅 Schedule</Badge>
          <h1 className="title">내 일정</h1>
        </div>
      </div>
    </div>
  );
}
