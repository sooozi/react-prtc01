import RouteSkeletonBlock from "@/components/RouteSkeleton/RouteSkeletonBlock";
import "@/components/RouteSkeleton/RouteSkeleton.scss";

/** 글 작성·수정(Quill) 라우트 lazy 로딩용 스켈레톤 */
export default function RichTextRouteSkeleton() {
  return (
    <div className="route-skeleton route-skeleton--rich-text" role="status" aria-live="polite" aria-label="에디터 불러오는 중">
      <header className="route-skeleton__header">
        <RouteSkeletonBlock className="route-skeleton__badge" />
        <RouteSkeletonBlock className="route-skeleton__title" />
      </header>

      <RouteSkeletonBlock className="route-skeleton__subtitle" style={{ marginBottom: "1.25rem" }} />

      <div className="route-skeleton__toolbar">
        {Array.from({ length: 10 }, (_, i) => (
          <RouteSkeletonBlock key={i} className="route-skeleton__tool" />
        ))}
      </div>

      <RouteSkeletonBlock className="route-skeleton__editor" />
    </div>
  );
}
