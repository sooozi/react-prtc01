/**
 * 게시글 상세 본문 — Quill HTML 또는 legacy plain text 를 안전하게 렌더.
 */
import { isQuillContentEmpty } from "./isQuillContentEmpty";
import { preparePostHtmlForDisplay } from "./preparePostHtmlForDisplay";

type PostHtmlContentProps = {
  html: string;
  className?: string;
  emptyLabel?: string;
};

export function PostHtmlContent({
  html,
  className = "detail-content detail-content--prose",
  emptyLabel = "내용 없음",
}: PostHtmlContentProps) {
  if (isQuillContentEmpty(html)) {
    return <div className={className}>{emptyLabel}</div>;
  }

  const safeHtml = preparePostHtmlForDisplay(html);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
