import { useCallback, useMemo } from "react";
import { formatFileSize } from "@/utils/formatFileSize";
import type { ImageFileAttachFieldCreateProps } from "../types";
import {
  buildDuplicateSkipMessage,
  buildTooLongNameMessages,
  splitFilesByMaxNameLength,
} from "../lib/fileAddMessages";
import {
  filesToItemsWithIds,
  partitionByAttachmentIdentity,
} from "../lib/fileAttachItemUtils";
import { filterImageFiles } from "../lib/filterImageFiles";
import { useFileAddNotice } from "../hooks/useFileAddNotice";
import { useImageAttachReorder } from "../hooks/useImageAttachReorder";
import { AttachRowBody } from "../ui/AttachRowBody";
import { ImageFileAttachFieldShell } from "../ui/ImageFileAttachFieldShell";
import "../ImageFileAttachField.scss";

export function ImageFileAttachFieldCreate({
  fileInputId,
  items,
  onChange,
  fileInputRef,
  accept = "image/*",
  rootClassName = "",
}: ImageFileAttachFieldCreateProps) {
  const { message: fileAddNoticeMessage, showNotice } = useFileAddNotice();

  const { rootRef, reorderGhost, getRowClassName, handleReorderPointerDown } =
    useImageAttachReorder({
      items,
      onReorder: onChange,
      getRowDisplay: (item) => ({
        fileName: item.file.name,
        sizeLabel: formatFileSize(item.file.size),
      }),
    });

  const totalSizeBytes = useMemo(
    () => items.reduce((sum, i) => sum + i.file.size, 0),
    [items]
  );

  const onFilesAdded = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;

      const { okLength, tooLong } = splitFilesByMaxNameLength(files);
      const messageParts = buildTooLongNameMessages(tooLong);

      if (okLength.length === 0) {
        showNotice(messageParts);
        return;
      }

      const { add, skip } = partitionByAttachmentIdentity(okLength, items, undefined);
      const dupMsg = buildDuplicateSkipMessage(skip);
      if (dupMsg) messageParts.push(dupMsg);

      if (add.length > 0) {
        onChange([...items, ...filesToItemsWithIds(add)]);
      }

      showNotice(messageParts);
    },
    [items, onChange, showNotice]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (list) onFilesAdded(filterImageFiles(list));
      e.target.value = "";
    },
    [onFilesAdded]
  );

  const removeAt = useCallback(
    (index: number) => {
      const next = items.filter((_, i) => i !== index);
      onChange(next);
      if (next.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [items, onChange, fileInputRef]
  );

  return (
    <ImageFileAttachFieldShell
      rootRef={rootRef}
      rootClassName={rootClassName}
      fileInputId={fileInputId}
      fileInputRef={fileInputRef}
      accept={accept}
      onFileInputChange={handleFileInputChange}
      fileAddNoticeMessage={fileAddNoticeMessage}
      hasList={items.length > 0}
      reorderHint={
        <p className="image-file-attach__reorder-hint">
          아래 핸들을 <strong>드래그</strong>하여 이미지 <strong>순서</strong>를 바꿀 수 있어요
        </p>
      }
      totalSizeLabel={`총 ${formatFileSize(totalSizeBytes)}`}
      reorderGhost={reorderGhost}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          data-reorder-index={index}
          className={getRowClassName(index)}
        >
          <AttachRowBody
            fileName={item.file.name}
            sizeLabel={formatFileSize(item.file.size)}
            onHandlePointerDown={handleReorderPointerDown(index)}
            trailing={
              <button
                type="button"
                className="image-file-attach__remove"
                aria-label={`${item.file.name} 첨부 제거`}
                onClick={() => removeAt(index)}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span aria-hidden>×</span>
              </button>
            }
          />
        </li>
      ))}
    </ImageFileAttachFieldShell>
  );
}
