import RouteSkeletonBlock from "@/components/RouteSkeleton/RouteSkeletonBlock";
import "@/components/RouteSkeleton/RouteSkeleton.scss";

/** 게시글 상세 라우트 lazy 로딩용 스켈레톤 */
export default function PostDetailRouteSkeleton() {
  return (
    <div className="route-skeleton route-skeleton--post-detail" role="status" aria-live="polite" aria-label="게시글 상세 불러오는 중">
      <header className="route-skeleton__header">
        <RouteSkeletonBlock className="route-skeleton__badge" />
        <RouteSkeletonBlock className="route-skeleton__title" />
      </header>

      <div className="route-skeleton__actions">
        <RouteSkeletonBlock className="route-skeleton__action-btn" />
        <RouteSkeletonBlock className="route-skeleton__action-btn" />
        <RouteSkeletonBlock className="route-skeleton__action-btn" />
      </div>

      <article className="route-skeleton__card">
        <RouteSkeletonBlock className="route-skeleton__meta-line route-skeleton__meta-line--short" />
        <RouteSkeletonBlock className="route-skeleton__meta-line route-skeleton__meta-line--medium" />
        {Array.from({ length: 8 }, (_, i) => (
          <RouteSkeletonBlock key={i} className="route-skeleton__body-line" />
        ))}
      </article>

      <RouteSkeletonBlock className="route-skeleton__title" style={{ width: "8rem", marginBottom: "1rem" }} />
      {Array.from({ length: 3 }, (_, i) => (
        <RouteSkeletonBlock key={i} className="route-skeleton__row" style={{ height: "3.5rem", marginBottom: "0.5rem", borderRadius: "12px" }} />
      ))}
    </div>
  );
}
