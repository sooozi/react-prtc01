import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import { arrayMove } from "@/utils/arrayMove";
import { formatFileSize } from "@/utils/formatFileSize";
import type { FileWithId, ImageFilePreviousEntry } from "./ImageFileAttachField.types";
import { filesToItemsWithIds, partitionByAttachmentIdentity } from "./fileAttachItemUtils";
import "./ImageFileAttachField.scss";

const GRIP_SVG = (
  <svg
    className="image-file-attach__grip-icon"
    width="22"
    height="16"
    viewBox="0 0 22 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="4" x2="17" y2="4" />
      <line x1="5" y1="8" x2="17" y2="8" />
      <line x1="5" y1="12" x2="17" y2="12" />
    </g>
  </svg>
);

// 컴포넌트 속성 타입
type Props = {
  fileInputId: string; // 파일 입력 요소 ID
  items: FileWithId[]; // 첨부 파일 목록
  onChange: (items: FileWithId[]) => void; // 첨부 파일 목록 변경
  fileInputRef: RefObject<HTMLInputElement | null>; // 파일 입력 요소 참조
  accept?: string; // 파일 타입 필터
  rootClassName?: string; // 루트 컴포넌트 클래스 이름
  /** 서버에 이미 있는 이미지(읽기 전용). 수정 화면에서만 넣음 */
  previousAttachments?: ImageFilePreviousEntry[];
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
  previousAttachments,
}: Props) {
  const hasPrevious = (previousAttachments?.length ?? 0) > 0;
  const hasListInBlock = hasPrevious || items.length > 0;
  const [overIndex, setOverIndex] = useState<number | null>(null); // 드래그 중인 행 인덱스
  const [reorderFromIndex, setReorderFromIndex] = useState<number | null>(null); // 드래그 시작 행 인덱스
  const reorderFromRef = useRef<number | null>(null); // 끌기 시작 인덱스(ref)
  const [duplicateAddHint, setDuplicateAddHint] = useState(""); // 같은 파일명 추가 힌트
  const duplicateHintTRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 같은 파일명 추가 힌트 타임아웃

  // 같은 파일명 추가 힌트 타임아웃 초기화
  useEffect(() => {
    return () => {
      if (duplicateHintTRef.current) {
        clearTimeout(duplicateHintTRef.current);
      }
    };
  }, []);

  // 첨부 파일 합계 용량
  const totalSizeBytes = useMemo(
    () => items.reduce((sum, i) => sum + i.file.size, 0),
    [items]
  );

  // 파일 추가(같은 “이름+확(소문자)”는 목록/기존/같은 선택 묶음 안에서 1건만)
  const onFilesAdded = (files: File[]) => {
    if (files.length === 0) return;
    const { add, skip } = partitionByAttachmentIdentity(files, items, previousAttachments);
    if (skip.length > 0) {
      if (duplicateHintTRef.current) clearTimeout(duplicateHintTRef.current);
      const list =
        skip.length === 1
          ? `“${skip[0]!.name.length > 50 ? `${skip[0]!.name.slice(0, 50)}…` : skip[0]!.name}”`
          : `(${skip.length}개)`;
      setDuplicateAddHint(
        `같은 파일명(확장자는 소문자로 비교)이 이미 있어 추가하지 않았습니다. ${list}`
      );
      duplicateHintTRef.current = setTimeout(() => {
        setDuplicateAddHint("");
        duplicateHintTRef.current = null;
      }, 9000);
    }
    if (add.length === 0) return;
    onChange([...items, ...filesToItemsWithIds(add)]);
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
      {duplicateAddHint && (
        <p className="image-file-attach__dup-hint" role="alert">
          {duplicateAddHint}
        </p>
      )}
      {hasListInBlock && (
        <div className="image-file-attach__reorder-block">
          <div className="image-file-attach__reorder-block-top">
            <div className="image-file-attach__reorder-headline">
              <h3 className="image-file-attach__reorder-block-title">첨부 이미지 순서</h3>
            </div>
            {items.length > 0 && (
              <div className="image-file-attach__reorder-hint-row">
                <p className="image-file-attach__reorder-hint">
                  아래 핸들을 <strong>드래그</strong>해서 이미지 <strong>순서</strong>를 바꿀 수 있어요
                </p>
                <span className="image-file-attach__reorder-total">
                  총 {formatFileSize(totalSizeBytes)}
                </span>
              </div>
            )}
          </div>
          <ol className="image-file-attach__list" aria-label="첨부된 이미지">
            {hasPrevious &&
              previousAttachments?.map((f) => (
                <ImageFileReadOnlyRow
                  key={String(f.id)}
                  name={f.name}
                  sizeBytes={f.sizeBytes}
                />
              ))}
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
                // 드래그 시작
                onDragStart={() => {
                  flushSync(() => {
                    setReorderFromIndex(index);
                    setOverIndex(null);
                  });
                  reorderFromRef.current = index;
                }}
                // 드래그 중
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (reorderFromRef.current == null) return; // 드래그 시작 행 인덱스가 없으면 종료
                  if (overIndex !== index) setOverIndex(index); // 드래그 중인 행 인덱스 업데이트
                }}
                // 이 행에 드롭: 순서 반영 또는(파일 드롭이면) 순서 변경 없이 상태만 초기화
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // 파일 드롭이면 순서 변경 없이 상태만 초기화
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setReorderFromIndex(null);
                    reorderFromRef.current = null; // 끌기 시작 인덱스(ref) 해제
                    setOverIndex(null); // 드롭 대상 하이라이트 해제
                    return;
                  }
                  // 파일 드롭이 아니면 순서 반영
                  const from = reorderFromRef.current;
                  if (from == null) return;
                  if (from !== index) onChange(arrayMove(items, from, index)); // 시작(from) → 놓은 위치(index)로 순서 반영
                  setReorderFromIndex(null);
                  reorderFromRef.current = null;
                  setOverIndex(null);
                }}
                // 드래그 세션 종료(바깥에 놓음·취소 포함) — onDrop이 안 불릴 때도 정리
                onDragEnd={() => {
                  setReorderFromIndex(null); // 드래그 시작 행 인덱스 초기화
                  reorderFromRef.current = null; // 끌기 시작 인덱스(ref) 해제
                  setOverIndex(null); // 드롭 대상 하이라이트 해제
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

      <label htmlFor={fileInputId} className="image-file-attach__add">
        <span className="image-file-attach__add-title">이미지 선택</span>
        <span className="image-file-attach__add-sub">해당 영역을 클릭해 PNG, JPG, GIF, WebP 등의 이미지를 선택하세요.</span>
      </label>
    </div>
  );
}

/**
 * 서버에 이미 있는 기존 첨부 — 새로 추가한 행과 동일한 레이아웃(핸들·× 포함).
 * 드래그·삭제는 동작하지 않습니다.
 */
export function ImageFileReadOnlyRow({
  name,
  sizeBytes,
}: {
  name: string;
  sizeBytes?: number;
}) {
  return (
    <li
      className="image-file-attach__row image-file-attach__row--reorder image-file-attach__row--previous"
      draggable={false}
    >
      <span className="image-file-attach__handle-zone" aria-hidden>
        {GRIP_SVG}
      </span>
      <span className="image-file-attach__clip-emoji">📎</span>
      <div className="image-file-attach__file-meta">
        <span className="image-file-attach__name" title={name}>
          {name}
        </span>
        <span className="image-file-attach__size">
          {sizeBytes != null ? formatFileSize(sizeBytes) : "—"}
        </span>
      </div>
      <button
        type="button"
        className="image-file-attach__remove"
        disabled
        title="이미 저장된 첨부는 이 화면에서 삭제할 수 없어요"
      >
        ×
      </button>
    </li>
  );
}
