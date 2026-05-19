import RouteSkeletonBlock from "@/components/RouteSkeleton/RouteSkeletonBlock";
import "@/components/RouteSkeleton/RouteSkeleton.scss";

/** 일정 라우트 lazy 로딩용 스켈레톤 */
export default function ScheduleRouteSkeleton() {
  return (
    <div className="route-skeleton route-skeleton--schedule" role="status" aria-live="polite" aria-label="일정 불러오는 중">
      <header className="route-skeleton__header">
        <RouteSkeletonBlock className="route-skeleton__badge" />
        <RouteSkeletonBlock className="route-skeleton__title" />
      </header>

      <div className="route-skeleton__workspace">
        <div className="route-skeleton__calendar">
          <div className="route-skeleton__cal-toolbar">
            <RouteSkeletonBlock className="route-skeleton__cal-toolbar-btn" />
            <RouteSkeletonBlock className="route-skeleton__cal-title" />
            <RouteSkeletonBlock className="route-skeleton__cal-toolbar-btn" />
          </div>
          <div className="route-skeleton__cal-grid">
            {Array.from({ length: 35 }, (_, i) => (
              <RouteSkeletonBlock key={i} className="route-skeleton__cal-cell" />
            ))}
          </div>
        </div>
        <RouteSkeletonBlock className="route-skeleton__panel" />
      </div>
    </div>
  );
}
