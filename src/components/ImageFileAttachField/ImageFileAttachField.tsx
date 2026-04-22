import { useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import { arrayMove } from "@/utils/arrayMove";
import { formatFileSize } from "@/utils/formatFileSize";
import type { FileWithId } from "./ImageFileAttachField.types";
import { filesToItemsWithIds } from "./fileAttachItemUtils";
import "./ImageFileAttachField.scss";

const GRIP_SVG = (
  <svg
    className="image-file-attach__grip-icon"
    width="20"
    height="20"
    viewBox="0 0 12 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="2.5" cy="3" r="1.35" />
    <circle cx="9.5" cy="3" r="1.35" />
    <circle cx="2.5" cy="10" r="1.35" />
    <circle cx="9.5" cy="10" r="1.35" />
    <circle cx="2.5" cy="17" r="1.35" />
    <circle cx="9.5" cy="17" r="1.35" />
  </svg>
);

// 컴포넌트 속성 타입
type Props = {
  fileInputId: string;
  items: FileWithId[];
  onChange: (items: FileWithId[]) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  accept?: string;
  rootClassName?: string;
};

// 이미지 파일 필터링
function filterImageFiles(fileList: FileList | null): File[] {
  if (!fileList || fileList.length === 0) return [];
  return Array.from(fileList).filter((f) => f.type.startsWith("image/"));
}

export function ImageFileAttachField({
  fileInputId,
  items,
  onChange,
  fileInputRef,
  accept = "image/*",
  rootClassName = "",
}: Props) {
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [reorderFromIndex, setReorderFromIndex] = useState<number | null>(null);
  const reorderFromRef = useRef<number | null>(null);

  // 파일 추가
  const onFilesAdded = (files: File[]) => {
    if (files.length === 0) return;
    onChange([...items, ...filesToItemsWithIds(files)]);
  };

  // 파일 입력 요소 변경 시 파일 추가
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list) onFilesAdded(filterImageFiles(list));
    e.target.value = "";
  };

  // 첨부 제거
  const removeAt = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
    if (next.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={["image-file-attach", rootClassName].filter(Boolean).join(" ")}
    >
      <input
        ref={fileInputRef}
        id={fileInputId}
        className="image-file-attach__input-hidden"
        type="file"
        accept={accept}
        multiple
        onChange={handleFileInputChange}
      />
      <label htmlFor={fileInputId} className="image-file-attach__add">
        <span className="image-file-attach__add-title">이미지 선택</span>
        <span className="image-file-attach__add-sub">해당 영역을 클릭해 PNG, JPG, GIF, WebP 등의 이미지를 선택하세요.</span>
      </label>

      {items.length > 0 && (
        <div className="image-file-attach__reorder-block">
          <div className="image-file-attach__reorder-block-top">
            <h3 className="image-file-attach__reorder-block-title">올릴 이미지 순서</h3>
            <p
              className="image-file-attach__reorder-hint"
            >
              아래 막대를 <strong>드래그</strong>하면 올릴 <strong>순서</strong>를 바꿀 수 있어요
            </p>
          </div>
          <ol className="image-file-attach__list">
            {items.map((item, index) => (
              <li
                key={item.id}
                className={[
                  "image-file-attach__row",
                  "image-file-attach__row--reorder",
                  // 드래그 중인 행 위에 올라간 행
                  overIndex === index &&
                  reorderFromIndex != null &&
                  reorderFromIndex !== index
                    ? "image-file-attach__row--over"
                    : "",
                  // 드래그 중인 행 자신
                  reorderFromIndex === index ? "image-file-attach__row--dragging" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                draggable
                onDragStart={() => {
                  flushSync(() => {
                    setReorderFromIndex(index);
                    setOverIndex(null);
                  });
                  reorderFromRef.current = index;
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (reorderFromRef.current == null) return;
                  if (overIndex !== index) setOverIndex(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setReorderFromIndex(null);
                    reorderFromRef.current = null;
                    setOverIndex(null);
                    return;
                  }
                  const from = reorderFromRef.current;
                  if (from == null) return;
                  if (from !== index) onChange(arrayMove(items, from, index));
                  setReorderFromIndex(null);
                  reorderFromRef.current = null;
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setReorderFromIndex(null);
                  reorderFromRef.current = null;
                  setOverIndex(null);
                }}
              >
                <span
                  className="image-file-attach__handle-zone"
                >
                  {GRIP_SVG}
                </span>
                <span className="image-file-attach__clip-emoji">
                  📎
                </span>
                <div className="image-file-attach__file-meta">
                  <span className="image-file-attach__name" title={item.file.name}>
                    {item.file.name}
                  </span>
                  <span className="image-file-attach__size">
                    {formatFileSize(item.file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  className="image-file-attach__remove"
                  onClick={() => removeAt(index)}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  ×
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/** 서버에 남아 있는 기존 첨부(읽기 전용) — `ol` / `ul`의 `li`로 둡니다. */
export function ImageFileReadOnlyRow({ name }: { name: string }) {
  return (
    <li className="image-file-attach__row image-file-attach__row--read-only">
      <span className="image-file-attach__clip-emoji">
        📎
      </span>
      <span className="image-file-attach__name" title={name}>
        {name}
      </span>
    </li>
  );
}
