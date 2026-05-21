import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type FocusEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import "./Tooltip.scss";

interface TooltipProps {
  /** 툴팁에 표시할 내용 */
  content: string;
  /** 툴팁을 감쌀 자식 요소 */
  children: React.ReactNode;
  /** 툴팁이 비어 있거나 공백만 있으면 툴팁 미표시 */
  disabled?: boolean;
  /** true면 말줄임(overflow)이 있을 때만 툴팁 표시 */
  onlyWhenTruncated?: boolean;
}

type ShowReasons = {
  hover: boolean;
  focus: boolean;
  touch: boolean;
};

/** 자식 요소가 가로로 잘려 있는지 확인 (말줄임 여부) */
function isTruncated(el: HTMLElement | null): boolean {
  const target = (el?.firstElementChild as HTMLElement) ?? el;
  if (!target) return false;
  return target.scrollWidth > target.clientWidth;
}

export default function Tooltip({
  content,
  children,
  disabled = false,
  onlyWhenTruncated = false,
}: TooltipProps) {
  const tooltipId = useId();
  const [state, setState] = useState<{
    visible: boolean;
    top: number;
    left: number;
  }>({ visible: false, top: 0, left: 0 });

  const triggerRef = useRef<HTMLSpanElement>(null);
  const reasonsRef = useRef<ShowReasons>({ hover: false, focus: false, touch: false });

  const hide = useCallback(() => {
    reasonsRef.current = { hover: false, focus: false, touch: false };
    setState({ visible: false, top: 0, left: 0 });
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left + rect.width / 2,
    };
  }, []);

  const syncVisible = useCallback(() => {
    if (disabled || !content?.trim()) {
      hide();
      return;
    }

    const { hover, focus, touch } = reasonsRef.current;
    if (!hover && !focus && !touch) {
      hide();
      return;
    }

    const el = triggerRef.current;
    if (onlyWhenTruncated && !isTruncated(el)) {
      hide();
      return;
    }

    const pos = updatePosition();
    if (pos) {
      setState({ visible: true, top: pos.top, left: pos.left });
    } else {
      setState((prev) => ({ ...prev, visible: true }));
    }
  }, [content, disabled, hide, onlyWhenTruncated, updatePosition]);

  const onMouseEnter = () => {
    reasonsRef.current.hover = true;
    syncVisible();
  };

  const onMouseLeave = () => {
    reasonsRef.current.hover = false;
    syncVisible();
  };

  const onFocusCapture = () => {
    reasonsRef.current.focus = true;
    syncVisible();
  };

  const onBlurCapture = (e: FocusEvent<HTMLSpanElement>) => {
    const next = e.relatedTarget as Node | null;
    if (triggerRef.current?.contains(next)) return;
    reasonsRef.current.focus = false;
    syncVisible();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (disabled || !content?.trim()) return;
    if (e.pointerType !== "touch") return;
    // 버튼·링크 등은 focusin으로 툴팁 표시 — preventDefault로 탭 동작을 막지 않음
    if ((e.target as HTMLElement).closest("button, a, [href], input, select, textarea")) {
      return;
    }

    const el = triggerRef.current;
    if (onlyWhenTruncated && !isTruncated(el)) return;

    e.preventDefault();
    reasonsRef.current.touch = !reasonsRef.current.touch;
    syncVisible();
  };

  useEffect(() => {
    if (!state.visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        hide();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [state.visible, hide]);

  useEffect(() => {
    if (!state.visible || !reasonsRef.current.touch) return;

    const onDocumentPointerDown = (e: globalThis.PointerEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      reasonsRef.current.touch = false;
      syncVisible();
    };

    document.addEventListener("pointerdown", onDocumentPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocumentPointerDown, true);
  }, [state.visible, hide, syncVisible]);

  const tooltipEl =
    state.visible && content?.trim() ? (
      <div
        id={tooltipId}
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
        aria-describedby={state.visible ? tooltipId : undefined}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocusCapture={onFocusCapture}
        onBlurCapture={onBlurCapture}
        onPointerDown={onPointerDown}
      >
        {children}
      </span>
      {tooltipEl && createPortal(tooltipEl, document.body)}
    </>
  );
}
