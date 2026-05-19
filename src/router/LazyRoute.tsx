import { Suspense, type ReactNode } from "react";
import LoadingState from "@/components/LoadingState/LoadingState";
import {
  PostDetailRouteSkeleton,
  PostListRouteSkeleton,
  RichTextRouteSkeleton,
  ScheduleRouteSkeleton,
} from "@/components/RouteSkeleton";

/** lazy 라우트별 Suspense fallback 종류 */
export type LazyRouteFallback =
  | "compact"
  | "post-list"
  | "post-detail"
  | "schedule"
  | "rich-text";

function resolveFallback(kind: LazyRouteFallback) {
  switch (kind) {
    case "post-list":
      return <PostListRouteSkeleton />;
    case "post-detail":
      return <PostDetailRouteSkeleton />;
    case "schedule":
      return <ScheduleRouteSkeleton />;
    case "rich-text":
      return <RichTextRouteSkeleton />;
    default:
      return <LoadingState message="불러오는 중..." variant="compact" />;
  }
}

type LazyRouteProps = {
  children: ReactNode;
  fallback?: LazyRouteFallback;
};

/** React.lazy 페이지를 Suspense + 스켈레톤(또는 compact 로딩)으로 감쌉니다. */
export default function LazyRoute({ children, fallback = "compact" }: LazyRouteProps) {
  return <Suspense fallback={resolveFallback(fallback)}>{children}</Suspense>;
}
