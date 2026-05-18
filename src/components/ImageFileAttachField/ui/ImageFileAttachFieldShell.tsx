import type { ChangeEvent, ReactNode, RefObject } from "react";
import { MAX_ATTACHMENT_FILENAME_LENGTH } from "../lib/fileAttachItemUtils";
import { ReorderGhostPortal, type ReorderGhostState } from "./ReorderGhostPortal";

type ImageFileAttachFieldShellProps = {
  rootRef: RefObject<HTMLDivElement | null>;
  rootClassName?: string;
  fileInputId: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  accept: string;
  onFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fileAddNoticeMessage: string;
  hasList: boolean;
  reorderHint: ReactNode;
  totalSizeLabel: string;
  reorderGhost: ReorderGhostState | null;
  children: ReactNode;
};

export function ImageFileAttachFieldShell({
  rootRef,
  rootClassName = "",
  fileInputId,
  fileInputRef,
  accept,
  onFileInputChange,
  fileAddNoticeMessage,
  hasList,
  reorderHint,
  totalSizeLabel,
  reorderGhost,
  children,
}: ImageFileAttachFieldShellProps) {
  return (
    <div
      ref={rootRef}
      className={["image-file-attach", rootClassName].filter(Boolean).join(" ")}
    >
      <input
        ref={fileInputRef}
        id={fileInputId}
        className="image-file-attach__input-hidden"
        type="file"
        accept={accept}
        multiple
        onChange={onFileInputChange}
        aria-labelledby={`${fileInputId}-add-title`}
        aria-describedby={`${fileInputId}-add-hint`}
      />

      <label htmlFor={fileInputId} className="image-file-attach__add">
        <span id={`${fileInputId}-add-title`} className="image-file-attach__add-title">
          이미지 추가
        </span>
        <span id={`${fileInputId}-add-hint`} className="image-file-attach__add-sub">
          해당 영역을 클릭해 PNG, JPG, GIF, WebP 등의 이미지를 선택하세요. 파일명(확장자 포함)은{" "}
          {MAX_ATTACHMENT_FILENAME_LENGTH}자 이하만 가능합니다.
        </span>
      </label>

      {fileAddNoticeMessage && (
        <p className="image-file-attach__add-notice-message" role="alert">
          {fileAddNoticeMessage}
        </p>
      )}

      {hasList && (
        <div className="image-file-attach__reorder-block">
          <div className="image-file-attach__reorder-block-top">
            <div className="image-file-attach__reorder-headline">
              <h3 className="image-file-attach__reorder-block-title">첨부 이미지 순서</h3>
            </div>
            <div className="image-file-attach__reorder-hint-row">
              {reorderHint}
              <span className="image-file-attach__reorder-total">{totalSizeLabel}</span>
            </div>
          </div>
          <ol className="image-file-attach__list" aria-label="첨부된 이미지">
            {children}
          </ol>
        </div>
      )}

      <ReorderGhostPortal ghost={reorderGhost} />
    </div>
  );
}
