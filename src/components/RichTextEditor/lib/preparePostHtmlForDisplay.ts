import DOMPurify from "dompurify";

const HAS_HTML_TAG = /<[a-z][\s\S]*>/i;
const EMPTY_PARAGRAPH = /<p([^>]*)>\s*<\/p>/gi;

/** Quill 빈 줄 `<p></p>` → `<p><br></p>` (상세에서 한 줄 높이 확보) */
function normalizeQuillEmptyParagraphs(html: string): string {
  return html.replace(EMPTY_PARAGRAPH, "<p$1><br></p>");
}

/** Quill HTML sanitize — 저장(작성/수정) 시점과 표시 시점에 공통으로 사용 */
export function sanitizeQuillHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

/**
 * 상세 본문 표시용 HTML 준비.
 * - Quill HTML: sanitize 후 반환
 * - 예전 plain text 글: 이스케이프 후 `<p>` + `<br>` 로 줄바꿈 유지
 */
export function preparePostHtmlForDisplay(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (HAS_HTML_TAG.test(trimmed)) {
    const sanitized = sanitizeQuillHtml(trimmed);
    return normalizeQuillEmptyParagraphs(sanitized);
  }

  const escaped = trimmed
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `<p>${escaped.replace(/\n/g, "<br>")}</p>`;
}
