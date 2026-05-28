import RouteSkeletonBlock from "@/components/RouteSkeleton/RouteSkeletonBlock";
import "@/components/RouteSkeleton/RouteSkeleton.scss";
import "./BoardListDataSkeleton.scss";

export type BoardListDataSkeletonProps = {
  rows?: number;
};

/** 게시글 목록 "데이터 로딩" 스켈레톤 */
export default function BoardListDataSkeleton({ rows = 8 }: BoardListDataSkeletonProps) {
  return (
    <div className="board-list-data-skeleton" role="status" aria-live="polite" aria-label="게시글 목록 불러오는 중">
      <div className="board-list-data-skeleton__table">
        <RouteSkeletonBlock className="board-list-data-skeleton__head" />
        {Array.from({ length: rows }, (_, i) => (
          <RouteSkeletonBlock key={i} className="board-list-data-skeleton__row" />
        ))}
      </div>
    </div>
  );
}

