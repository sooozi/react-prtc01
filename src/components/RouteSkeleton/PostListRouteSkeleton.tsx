import RouteSkeletonBlock from "@/components/RouteSkeleton/RouteSkeletonBlock";
import "@/components/RouteSkeleton/RouteSkeleton.scss";

/** 게시판 목록 라우트 lazy 로딩용 스켈레톤 */
export default function PostListRouteSkeleton() {
  return (
    <div className="route-skeleton route-skeleton--post-list" role="status" aria-live="polite" aria-label="게시판 불러오는 중">
      <header className="route-skeleton__header">
        <RouteSkeletonBlock className="route-skeleton__badge" />
        <RouteSkeletonBlock className="route-skeleton__title" />
        <RouteSkeletonBlock className="route-skeleton__subtitle" />
      </header>

      <div className="route-skeleton__search">
        <RouteSkeletonBlock className="route-skeleton__search-field" />
        <RouteSkeletonBlock className="route-skeleton__search-field" />
        <RouteSkeletonBlock className="route-skeleton__search-field" />
        <RouteSkeletonBlock className="route-skeleton__search-btn" />
      </div>

      <div className="route-skeleton__table">
        <RouteSkeletonBlock className="route-skeleton__table-head" />
        {Array.from({ length: 6 }, (_, i) => (
          <RouteSkeletonBlock key={i} className="route-skeleton__row" />
        ))}
      </div>
    </div>
  );
}
