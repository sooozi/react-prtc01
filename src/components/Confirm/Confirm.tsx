import { useEffect } from "react";
import Button from "@/components/Button/Button";
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
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "confirm-title" : undefined}
      aria-describedby="confirm-message"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
}
