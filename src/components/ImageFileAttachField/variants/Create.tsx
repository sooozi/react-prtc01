import { useCallback, useMemo } from "react";
import { formatFileSize } from "@/utils/formatFileSize";
import type { ImageFileAttachFieldCreateProps } from "../types";
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
  accept = ATTACHMENT_FILE_INPUT_ACCEPT,
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

  // 파일 선택창에서 파일 선택 시 호출되는 함수
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files; // 선택된 파일 목록
      e.target.value = "";
      if (!list) return; // 선택된 파일 목록이 없으면 종료
      const { allowed, rejected } = partitionFileListByAttachmentAllowlist(list); // 허용된 파일과 차단된 파일 목록을 분리
      onFilesAdded(allowed, buildRejectedAllowlistMessages(rejected)); // 허용된 파일과 차단된 파일 목록을 전달
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
