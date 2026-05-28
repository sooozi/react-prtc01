import RouteSkeletonBlock from "@/components/RouteSkeleton/RouteSkeletonBlock";
import "@/components/RouteSkeleton/RouteSkeleton.scss";
import "./PostDetailDataSkeleton.scss";

/** 게시글 상세 "데이터 로딩" 스켈레톤 */
export default function PostDetailDataSkeleton() {
  return (
    <div className="post-detail-data-skeleton" role="status" aria-live="polite" aria-label="게시글 상세 불러오는 중">
      <div className="post-detail-data-skeleton__meta">
        <RouteSkeletonBlock className="post-detail-data-skeleton__meta-chip" />
        <RouteSkeletonBlock className="post-detail-data-skeleton__meta-chip" />
        <RouteSkeletonBlock className="post-detail-data-skeleton__meta-chip" />
        <RouteSkeletonBlock className="post-detail-data-skeleton__meta-chip post-detail-data-skeleton__meta-chip--short" />
      </div>

      <RouteSkeletonBlock className="post-detail-data-skeleton__title" />

      <div className="post-detail-data-skeleton__body" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <RouteSkeletonBlock key={i} className="post-detail-data-skeleton__line" />
        ))}
      </div>
    </div>
  );
}

