import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import "./Tooltip.scss";

interface TooltipProps {
  /** 툴팁에 표시할 내용 */
  content: string;
  /** 툴팁을 감쌀 자식 요소 (hover 시 툴팁 표시) */
  children: React.ReactNode;
  /** 툴팁이 비어 있거나 공백만 있으면 툴팁 미표시 */
  disabled?: boolean;
  /** true면 말줄임(overflow)이 있을 때만 툴팁 표시 */
  onlyWhenTruncated?: boolean;
}

/** 자식 요소가 가로로 잘려 있는지 확인 (말줄임 여부) */
function isTruncated(el: HTMLElement | null): boolean {
  // 자식 요소 찾기
  const target = (el?.firstElementChild as HTMLElement) ?? el;
  // 자식 요소가 없으면 말줄임 없음
  if (!target) return false;
  // 자식 요소의 스크롤 너비가 클라이언트 너비보다 크면 말줄임 있음
  return target.scrollWidth > target.clientWidth;
}

export default function Tooltip({
  content,
  children,
  disabled = false,
  onlyWhenTruncated = false,
}: TooltipProps) {
  const [state, setState] = useState<{
    visible: boolean;
    top: number;
    left: number;
  }>({ visible: false, top: 0, left: 0 });

  // 툴팁 트리거 요소 참조
  const triggerRef = useRef<HTMLSpanElement>(null);

  // 툴팁 표시
  const show = () => {
    // 툴팁 비활성화 또는 내용이 없으면 툴팁 표시하지 않음
    if (disabled || !content?.trim()) return;
    const el = triggerRef.current;
    // 말줄임 여부 확인 (onlyWhenTruncated가 true이고 자식 요소가 말줄임 없으면 툴팁 표시하지 않음)
    if (onlyWhenTruncated && !isTruncated(el)) return;
    // 자식 요소가 있으면 툴팁 표시
    if (el) {
      // 자식 요소의 바운딩 클라이언트 너비 찾기
      const rect = el.getBoundingClientRect();
      // 툴팁 상태 업데이트
      setState({
        visible: true,
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    } else {
      setState((prev) => ({ ...prev, visible: true }));
    }
  };
  
  // 툴팁 숨기기
  const hide = () => setState({ visible: false, top: 0, left: 0 });

  // 툴팁 요소 생성
  const tooltipEl =
    state.visible && content?.trim() ? (
      <div
        className="tooltip-bubble"
        role="tooltip"
        style={{
          position: "fixed",
          top: state.top,
          left: state.left,
        }}
      >
        {content}
      </div>
    ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {children}
      </span>
      {tooltipEl && createPortal(tooltipEl, document.body)}
    </>
  );
}
