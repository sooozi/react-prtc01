/**
 * Quill 본문이 비었는지 판별하는 순수 함수
 * `content.trim()`만으로는 `<p><br></p>` 같은 빈 HTML을 걸러내지 못해 제출 검증에 사용
 */
export function isQuillContentEmpty(html: string): boolean {
  const stripped = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return stripped.length === 0;
}
