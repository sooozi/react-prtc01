import { type ReactNode } from "react";
import { GripHandleIcon } from "@/components/icons/GripHandleIcon";

export function AttachRowBody({
  fileName,
  sizeLabel,
  handleAriaHidden,
  onHandlePointerDown, // 순서 변경: 드래그하여 놓기
  trailing,
}: {
  fileName: string;
  sizeLabel: string;
  handleAriaHidden?: boolean;
  onHandlePointerDown?: (e: React.PointerEvent<HTMLSpanElement>) => void; // 순서 변경: 드래그하여 놓기
  trailing: ReactNode; // 삭제 버튼
}) {
  return (
    <span className="image-file-attach__row-inner">
      <span
        className="image-file-attach__handle-zone"
        draggable={false}
        {...(handleAriaHidden ? { "aria-hidden": true as const } : {})} // 핸들 영역 숨김 처리
        {...(onHandlePointerDown // 순서 변경: 드래그하여 놓기
          ? {
              role: "button" as const,
              tabIndex: 0,
              "aria-label": "순서 변경: 드래그하여 놓기",
              onPointerDown: onHandlePointerDown,
            }
          : {})}
      >
        <GripHandleIcon className="image-file-attach__grip-icon" />
      </span>
      <span className="image-file-attach__clip-emoji">📎</span>
      <div className="image-file-attach__file-meta">
        <span className="image-file-attach__name" title={fileName}>
          {fileName}
        </span>
        <span className="image-file-attach__size">{sizeLabel}</span>
      </div>
      {trailing}
    </span>
  );
}
