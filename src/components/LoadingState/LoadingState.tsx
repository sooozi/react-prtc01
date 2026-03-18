import "@/components/LoadingState/LoadingState.scss";

type LoadingStateVariant = "default" | "compact";

interface LoadingStateProps {
  /** 로딩 문구 (기본: "데이터를 불러오는 중...") */
  message?: string;
  /** compact = 작은 스피너/패딩 (상세·수정 페이지용) */
  variant?: LoadingStateVariant;
  className?: string;
}

const DEFAULT_MESSAGE = "데이터를 불러오는 중...";

export default function LoadingState({
  message = DEFAULT_MESSAGE,
  variant = "default",
  className = "",
}: LoadingStateProps) {
  const wrapperClass = variant === "compact" ? "detail-loading" : "loading-state";
  const finalClassName = [wrapperClass, className].filter(Boolean).join(" ");

  return (
    <div className={finalClassName} role="status" aria-live="polite">
      <div className="spinner" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
