import { createPortal } from "react-dom";
import { GripHandleIcon } from "@/components/icons/GripHandleIcon";

/** 포인터 재정렬 시 커서를 따라다니는 미리보기 — `pointer-events: none`으로 행 hit-test 유지 */
export type ReorderGhostState = {
  left: number;
  top: number;
  width: number;
  offsetX: number;
  offsetY: number;
  fileName: string;
  sizeLabel: string;
};

export function ReorderGhostPortal({ ghost }: { ghost: ReorderGhostState | null }) {
  if (ghost == null) return null;
  return createPortal(
    <div
      className="image-file-attach__drag-ghost"
      style={{
        position: "fixed",
        left: ghost.left,
        top: ghost.top,
        width: ghost.width,
        zIndex: 10000,
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <div className="image-file-attach__drag-ghost-row">
        <span className="image-file-attach__drag-ghost-grip" aria-hidden>
          <GripHandleIcon className="image-file-attach__grip-icon" />
        </span>
        <span className="image-file-attach__clip-emoji">📎</span>
        <div className="image-file-attach__file-meta">
          <span className="image-file-attach__name">{ghost.fileName}</span>
          <span className="image-file-attach__size">{ghost.sizeLabel}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
