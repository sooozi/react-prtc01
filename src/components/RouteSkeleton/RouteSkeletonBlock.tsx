import type { CSSProperties } from "react";

type RouteSkeletonBlockProps = {
  className?: string;
  style?: CSSProperties;
};

/** 스켈레톤 회색 블록 한 조각 */
export default function RouteSkeletonBlock({ className = "", style }: RouteSkeletonBlockProps) {
  return <span className={["route-skeleton__block", className].filter(Boolean).join(" ")} style={style} aria-hidden />;
}
