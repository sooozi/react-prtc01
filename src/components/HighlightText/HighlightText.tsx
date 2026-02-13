import "./HighlightText.scss";

interface HighlightTextProps {
  /** 표시할 텍스트 */
  text: string;
  /** 하이라이트할 검색어 */
  keyword: string;
  /** 하이라이트 스타일 클래스 (선택사항) */
  highlightClassName?: string;
}

/**
 * 검색어 하이라이트 컴포넌트
 * 텍스트에서 검색어와 일치하는 부분을 하이라이트 처리합니다.
 *
 * @example
 * <HighlightText text="김철수" keyword="김" />
 * // 결과: <mark>김</mark>철수
 */
export default function HighlightText({
  text,
  keyword,
  highlightClassName = "highlight",
}: HighlightTextProps) {
  // 검색어가 없으면 그냥 텍스트 반환
  if (!keyword.trim()) {
    return <>{text}</>;
  }

  // 특수문자 이스케이프 처리 (정규식 오류 방지)
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedKeyword})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}
