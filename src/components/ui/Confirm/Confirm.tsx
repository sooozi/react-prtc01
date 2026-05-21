import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button/Button";
import { useFloatingLayer } from "@/hooks/useFloatingLayer";
import "./Confirm.scss";

export type ConfirmVariant = "default" | "danger";

export interface ConfirmProps {
  /** 열림 여부 */
  open: boolean;
  /** 메시지 (필수) */
  message: string;
  /** 제목 (선택) */
  title?: string;
  /** 확인 버튼 텍스트 (기본: "확인") */
  confirmLabel?: string;
  /** 취소 버튼 텍스트 (기본: "취소") */
  cancelLabel?: string;
  /** danger 시 확인 버튼을 빨간색 계열로 (삭제 등) */
  variant?: ConfirmVariant;
  /** 확인 클릭 시 */
  onConfirm: () => void;
  /** 취소 클릭 시 */
  onCancel: () => void;
}

export default function Confirm({
  open,
  message,
  title,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalPanelRef = useRef<HTMLDivElement>(null);

  useFloatingLayer({
    open,
    layerRootRef: modalPanelRef,
    onEscape: onCancel,
    lockScroll: true,
    trapTab: true,
    focusInitial: "first-tabbable",
    restoreFocusMode: "previous",
  });

  // 배경·모달 면 상호작용 — div에 JSX onClick/onKeyDown을 두면 jsx-a11y 예외가 필요해 DOM 리스너로 처리
  useLayoutEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const modal = modalPanelRef.current;
    if (!overlay || !modal) return;

    const onOverlayClick = (e: MouseEvent) => {
      if (e.target === e.currentTarget) onCancel();
    };
    const onOverlayKeyDown = (e: KeyboardEvent) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onCancel();
      }
    };

    // 모달 패널에 stopPropagation을 걸면 클릭이 body까지 버블링되지 않아
    // createPortal(document.body)의 React 이벤트 위임이 동작하지 않는다.
    overlay.addEventListener("click", onOverlayClick);
    overlay.addEventListener("keydown", onOverlayKeyDown);
    return () => {
      overlay.removeEventListener("click", onOverlayClick);
      overlay.removeEventListener("keydown", onOverlayKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  const root =
    typeof document !== "undefined" && document.body ? document.body : null;
  if (!root) return null;

  const labelledBy = title ? "confirm-title" : "confirm-message";
  const describedBy = title ? "confirm-message" : undefined;

  return createPortal(
    <div
      ref={overlayRef}
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      <div ref={modalPanelRef} className="confirm-modal" tabIndex={-1}>
        {title && (
          <h2 id="confirm-title" className="confirm-title">
            {title}
          </h2>
        )}
        <p id="confirm-message" className="confirm-message">
          {message}
        </p>
        <div className="confirm-actions">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    root,
  );
}
