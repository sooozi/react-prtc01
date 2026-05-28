import { useCallback, useMemo } from "react";
import { formatFileSize } from "@/utils/formatFileSize";
import type {
  FileWithId,
  ImageFileAttachFieldUnifiedProps,
  ImageFilePreviousEntry,
  ImageFileUnifiedRow,
} from "../types";
import { ATTACHMENT_FILE_INPUT_ACCEPT } from "../lib/attachmentAllowlist";
import {
  buildDuplicateSkipMessage,
  buildRejectedAllowlistMessages,
  buildTooLongNameMessages,
  splitFilesByMaxNameLength,
} from "../lib/fileAddMessages";
import {
  filesToItemsWithIds,
  partitionByAttachmentIdentity,
} from "../lib/fileAttachItemUtils";
import { partitionFileListByAttachmentAllowlist } from "../lib/filterImageFiles";
import {
  getUnifiedRowDisplay,
  getUnifiedRowKey,
  sumUnifiedRowsSizeBytes,
} from "../lib/unifiedRowDisplay";
import { useFileAddNotice } from "../hooks/useFileAddNotice";
import { useImageAttachReorder } from "../hooks/useImageAttachReorder";
import { AttachRowBody } from "../ui/AttachRowBody";
import { ImageFileAttachFieldShell } from "../ui/ImageFileAttachFieldShell";
import "../ImageFileAttachField.scss";

export function ImageFileAttachFieldUnifiedEdit({
  fileInputId,
  fileInputRef,
  accept = ATTACHMENT_FILE_INPUT_ACCEPT,
  rootClassName = "",
  unifiedRows: rows,
  onUnifiedRowsChange: onRowsChange,
}: ImageFileAttachFieldUnifiedProps) {
  const { message: fileAddNoticeMessage, showNotice } = useFileAddNotice();

  const { rootRef, reorderGhost, getRowClassName, handleReorderPointerDown } =
    useImageAttachReorder({
      items: rows,
      onReorder: onRowsChange,
      getRowDisplay: getUnifiedRowDisplay,
    });

  const totalSizeBytes = useMemo(() => sumUnifiedRowsSizeBytes(rows), [rows]);

  const onFilesAdded = useCallback(
    (files: File[], initialMessages: string[] = []) => {
      if (files.length === 0) {
        if (initialMessages.length > 0) showNotice(initialMessages);
        return;
      }

      const { okLength, tooLong } = splitFilesByMaxNameLength(files);
      const messageParts = [...initialMessages, ...buildTooLongNameMessages(tooLong)];

      if (okLength.length === 0) {
        showNotice(messageParts);
        return;
      }

      const currentItems: FileWithId[] = rows
        .filter((r): r is Extract<ImageFileUnifiedRow, { kind: "local" }> => r.kind === "local")
        .map((r) => ({ id: r.id, file: r.file }));

      const previous: ImageFilePreviousEntry[] = rows
        .filter((r): r is Extract<ImageFileUnifiedRow, { kind: "server" }> => r.kind === "server")
        .map((r) => ({ id: r.fileId, name: r.name }));

      const { add, skip } = partitionByAttachmentIdentity(okLength, currentItems, previous);
      const dupMsg = buildDuplicateSkipMessage(skip);
      if (dupMsg) messageParts.push(dupMsg);

      if (add.length > 0) {
        const newLocals = filesToItemsWithIds(add).map((it) => ({
          kind: "local" as const,
          id: it.id,
          file: it.file,
        }));
        onRowsChange([...rows, ...newLocals]);
      }

      showNotice(messageParts);
    },
    [rows, onRowsChange, showNotice]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      e.target.value = "";
      if (!list) return;
      const { allowed, rejected } = partitionFileListByAttachmentAllowlist(list);
      onFilesAdded(allowed, buildRejectedAllowlistMessages(rejected));
    },
    [onFilesAdded]
  );

  const removeAt = useCallback(
    (index: number) => {
      const next = rows.filter((_row, i) => i !== index);
      onRowsChange(next);
      const stillHasLocal = next.some((r) => r.kind === "local");
      if (!stillHasLocal && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [rows, onRowsChange, fileInputRef]
  );

  const totalSizeLabel =
    totalSizeBytes > 0 ? `총 ${formatFileSize(totalSizeBytes)}` : "총 —";

  return (
    <ImageFileAttachFieldShell
      rootRef={rootRef}
      rootClassName={rootClassName}
      fileInputId={fileInputId}
      fileInputRef={fileInputRef}
      accept={accept}
      onFileInputChange={handleFileInputChange}
      fileAddNoticeMessage={fileAddNoticeMessage}
      hasList={rows.length > 0}
      reorderHint={
        rows.length >= 2 ? (
          <p className="image-file-attach__reorder-hint">
            아래 핸들을 <strong>드래그</strong>하여 이미지 <strong>순서</strong>를 바꿀 수 있어요
          </p>
        ) : (
          <span className="image-file-attach__reorder-hint" aria-hidden="true" />
        )
      }
      totalSizeLabel={totalSizeLabel}
      reorderGhost={reorderGhost}
    >
      {rows.map((row, index) => {
        const { fileName, sizeLabel } = getUnifiedRowDisplay(row);

        return (
          <li
            key={getUnifiedRowKey(row)}
            data-reorder-index={index}
            className={getRowClassName(index)}
          >
            <AttachRowBody
              fileName={fileName}
              sizeLabel={sizeLabel}
              onHandlePointerDown={handleReorderPointerDown(index)}
              trailing={
                <button
                  type="button"
                  className="image-file-attach__remove"
                  aria-label={`${fileName} 첨부 제거`}
                  onClick={() => removeAt(index)}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <span aria-hidden>×</span>
                </button>
              }
            />
          </li>
        );
      })}
    </ImageFileAttachFieldShell>
  );
}
