import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/Button/Button";
import { getTabbableElements } from "@/utils/tabbable";
import "@/components/Confirm/Confirm.scss";

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
  const modalPanelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const moveFocusIntoModal = () => {
      const panel = modalPanelRef.current;
      if (!panel) return;
      const list = getTabbableElements(panel);
      (list[0] ?? panel).focus();
    };
    queueMicrotask(moveFocusIntoModal);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = modalPanelRef.current;
      if (!panel) return;
      const list = getTabbableElements(panel);
      if (list.length === 0) return;
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !panel.contains(active)) return;

      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open, onCancel]);

  if (!open) return null;

  const root =
    typeof document !== "undefined" && document.body ? document.body : null;
  if (!root) return null;

  const labelledBy = title ? "confirm-title" : "confirm-message";
  const describedBy = title ? "confirm-message" : undefined;

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- 배경 오버레이: role=dialog + 클릭·키보드로 닫기
    <div
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCancel();
        }
      }}
    >
      {/* 모달 면 클릭은 버블 차단용 — 키보드는 오버레이에서 처리 */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        ref={modalPanelRef}
        className="confirm-modal"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
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
