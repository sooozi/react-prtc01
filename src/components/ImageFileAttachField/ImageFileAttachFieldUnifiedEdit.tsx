import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { arrayMove } from "@/utils/arrayMove";
import { formatFileSize } from "@/utils/formatFileSize";
import type {
  FileWithId,
  ImageFileAttachFieldUnifiedProps,
  ImageFilePreviousEntry,
  ImageFileUnifiedRow,
} from "./ImageFileAttachField.types";
import {
  filesToItemsWithIds,
  MAX_ATTACHMENT_FILENAME_LENGTH,
  partitionByAttachmentIdentity,
} from "./fileAttachItemUtils";
import { filterImageFiles } from "./filterImageFiles";
import { AttachRowBody } from "./AttachRowBody";
import { ReorderGhostPortal, type ReorderGhostState } from "./ReorderGhostPortal";
import "./ImageFileAttachField.scss";

// 게시글 수정: 서버 첨부 + 신규를 한 목록에서 순서·삭제 처리
export function ImageFileAttachFieldUnifiedEdit({
  fileInputId,
  fileInputRef,
  accept = "image/*",
  rootClassName = "",
  unifiedRows: rows,
  onUnifiedRowsChange: onRowsChange,
}: ImageFileAttachFieldUnifiedProps) {
  const hasListInBlock = rows.length > 0;
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [reorderFromIndex, setReorderFromIndex] = useState<number | null>(null);
  const reorderFromRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef(rows);
  const onRowsChangeRef = useRef(onRowsChange);
  const overIndexRef = useRef<number | null>(null);
  const pointerReorderDetachRef = useRef<(() => void) | null>(null);
  const [fileAddHint, setFileAddHint] = useState("");
  const fileAddHintTRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [reorderGhost, setReorderGhost] = useState<ReorderGhostState | null>(null);
  const reorderGhostRef = useRef<ReorderGhostState | null>(null);
  const ghostMoveRafRef = useRef<number | null>(null);
  const pendingGhostPointerRef = useRef<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    rowsRef.current = rows;
    onRowsChangeRef.current = onRowsChange;
  }, [rows, onRowsChange]);

  useEffect(() => {
    return () => {
      pointerReorderDetachRef.current?.();
      pointerReorderDetachRef.current = null;
    };
  }, []);

  const clearReorderGhost = () => {
    if (ghostMoveRafRef.current != null) {
      cancelAnimationFrame(ghostMoveRafRef.current);
      ghostMoveRafRef.current = null;
    }
    pendingGhostPointerRef.current = null;
    reorderGhostRef.current = null;
    setReorderGhost(null);
  };

  const clearReorderVisual = () => {
    clearReorderGhost();
    reorderFromRef.current = null;
    overIndexRef.current = null;
    setReorderFromIndex(null);
    setOverIndex(null);
  };

  const scheduleReorderGhostMove = (clientX: number, clientY: number) => {
    pendingGhostPointerRef.current = { x: clientX, y: clientY };
    if (ghostMoveRafRef.current != null) return;
    ghostMoveRafRef.current = requestAnimationFrame(() => {
      ghostMoveRafRef.current = null;
      const p = pendingGhostPointerRef.current;
      const g = reorderGhostRef.current;
      if (!p || !g) return;
      const next: ReorderGhostState = {
        ...g,
        left: p.x - g.offsetX,
        top: p.y - g.offsetY,
      };
      reorderGhostRef.current = next;
      setReorderGhost(next);
    });
  };

  const updateOverFromPoint = (clientX: number, clientY: number) => {
    const root = rootRef.current;
    if (!root) {
      overIndexRef.current = null;
      setOverIndex(null);
      return;
    }
    const el = document.elementFromPoint(clientX, clientY);
    if (!el || !root.contains(el)) {
      overIndexRef.current = null;
      setOverIndex(null);
      return;
    }
    const row = el.closest("[data-reorder-index]") as HTMLElement | null;
    if (!row) {
      overIndexRef.current = null;
      setOverIndex(null);
      return;
    }
    const raw = row.getAttribute("data-reorder-index");
    const idx = raw == null ? NaN : parseInt(raw, 10);
    if (Number.isNaN(idx)) {
      overIndexRef.current = null;
      setOverIndex(null);
      return;
    }
    overIndexRef.current = idx;
    setOverIndex(idx);
  };

  const bindPointerReorderSession = (startIndex: number, pointerId: number) => {
    pointerReorderDetachRef.current?.();

    document.body.classList.add("image-file-attach--reorder-active");

    reorderFromRef.current = startIndex;
    overIndexRef.current = null;
    setReorderFromIndex(startIndex);
    setOverIndex(null);

    let ended = false;

    const moveOpts: AddEventListenerOptions = { passive: true };

    const detach = () => {
      if (ended) return;
      ended = true;
      document.removeEventListener("pointermove", onMove, moveOpts);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("pointercancel", onUp, true);
      document.body.classList.remove("image-file-attach--reorder-active");
      pointerReorderDetachRef.current = null;
      clearReorderVisual();
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      scheduleReorderGhostMove(ev.clientX, ev.clientY);
      updateOverFromPoint(ev.clientX, ev.clientY);
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const from = reorderFromRef.current;
      const to = overIndexRef.current;
      detach();
      if (from != null && to != null && from !== to) {
        onRowsChangeRef.current(arrayMove(rowsRef.current, from, to));
      }
    };

    pointerReorderDetachRef.current = detach;

    document.addEventListener("pointermove", onMove, moveOpts);
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("pointercancel", onUp, true);
  };

  const handleReorderHandlePointerDown =
    (index: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (rows.length < 2) return;
      e.preventDefault();
      e.stopPropagation();
      const rowEl = (e.currentTarget as HTMLElement).closest("[data-reorder-index]") as HTMLElement | null;
      if (!rowEl) return;
      const rect = rowEl.getBoundingClientRect();
      const row = rows[index];
      if (!row) return;
      const fileName = row.kind === "server" ? row.name : row.file.name;
      const sizeLabel =
        row.kind === "server"
          ? row.sizeBytes != null
            ? formatFileSize(row.sizeBytes)
            : "?"
          : formatFileSize(row.file.size);
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      const initial: ReorderGhostState = {
        left: e.clientX - offsetX,
        top: e.clientY - offsetY,
        width: rect.width,
        offsetX,
        offsetY,
        fileName,
        sizeLabel,
      };
      reorderGhostRef.current = initial;
      setReorderGhost(initial);
      bindPointerReorderSession(index, e.pointerId);
    };

  const scheduleFileAddHintClear = () => {
    if (fileAddHintTRef.current) clearTimeout(fileAddHintTRef.current);
    fileAddHintTRef.current = setTimeout(() => {
      setFileAddHint("");
      fileAddHintTRef.current = null;
    }, 9000);
  };

  useEffect(() => {
    return () => {
      if (fileAddHintTRef.current) {
        clearTimeout(fileAddHintTRef.current);
      }
    };
  }, []);

  /** 로컬 File.size + 서버 API의 sizeBytes(있을 때만 합산) */
  const totalSizeBytes = useMemo(
    () =>
      rows.reduce((sum: number, r: ImageFileUnifiedRow) => {
        if (r.kind === "local") return sum + r.file.size;
        return sum + (r.sizeBytes ?? 0);
      }, 0),
    [rows]
  );

  const onFilesAdded = (files: File[]) => {
    if (files.length === 0) return;

    const okLength: File[] = [];
    const tooLong: File[] = [];
    for (const f of files) {
      if (f.name.length > MAX_ATTACHMENT_FILENAME_LENGTH) tooLong.push(f);
      else okLength.push(f);
    }

    const messageParts: string[] = [];
    if (tooLong.length > 0) {
      if (tooLong.length === 1) {
        const n = tooLong[0]!.name;
        const shown = n.length > 50 ? `${n.slice(0, 50)}…` : n;
        messageParts.push(
          `파일명(확장자 포함)은 ${MAX_ATTACHMENT_FILENAME_LENGTH}자 이하여야 합니다. 추가하지 않음: “${shown}”`
        );
      } else {
        messageParts.push(
          `파일명(확장자 포함)이 ${MAX_ATTACHMENT_FILENAME_LENGTH}자를 넘는 ${tooLong.length}개는 추가하지 않았습니다.`
        );
      }
    }

    if (okLength.length === 0) {
      if (messageParts.length > 0) {
        setFileAddHint(messageParts.join(" "));
        scheduleFileAddHintClear();
      }
      return;
    }

    const currentItems: FileWithId[] = rows
      .filter((r): r is Extract<ImageFileUnifiedRow, { kind: "local" }> => r.kind === "local")
      .map((r) => ({ id: r.id, file: r.file }));
    const previous: ImageFilePreviousEntry[] = rows
      .filter((r): r is Extract<ImageFileUnifiedRow, { kind: "server" }> => r.kind === "server")
      .map((r) => ({ id: r.fileId, name: r.name }));

    const { add, skip } = partitionByAttachmentIdentity(okLength, currentItems, previous);
    if (skip.length > 0) {
      const list =
        skip.length === 1
          ? `“${skip[0]!.name.length > 50 ? `${skip[0]!.name.slice(0, 50)}…` : skip[0]!.name}”`
          : `(${skip.length}개)`;
      messageParts.push(
        `같은 파일명(확장자는 소문자로 비교)이 이미 있어 추가하지 않았습니다. ${list}`
      );
    }
    if (add.length > 0) {
      const newLocals = filesToItemsWithIds(add).map((it) => ({
        kind: "local" as const,
        id: it.id,
        file: it.file,
      }));
      onRowsChange([...rows, ...newLocals]);
    }
    if (messageParts.length > 0) {
      setFileAddHint(messageParts.join(" "));
      scheduleFileAddHintClear();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list) onFilesAdded(filterImageFiles(list));
    e.target.value = "";
  };

  const removeAt = (index: number) => {
    const next = rows.filter((_row: ImageFileUnifiedRow, i: number) => i !== index);
    onRowsChange(next);
    const stillHasLocal = next.some((r: ImageFileUnifiedRow) => r.kind === "local");
    if (!stillHasLocal && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        onChange={handleFileInputChange}
      />

      <label htmlFor={fileInputId} className="image-file-attach__add">
        <span className="image-file-attach__add-title">이미지 선택</span>
        <span className="image-file-attach__add-sub">
          해당 영역을 클릭해 PNG, JPG, GIF, WebP 등의 이미지를 선택하세요. 파일명(확장자 포함)은{" "}
          {MAX_ATTACHMENT_FILENAME_LENGTH}자 이하만 가능합니다.
        </span>
      </label>

      {fileAddHint && (
        <p className="image-file-attach__dup-hint" role="alert">
          {fileAddHint}
        </p>
      )}

      {hasListInBlock && (
        <div className="image-file-attach__reorder-block">
          <div className="image-file-attach__reorder-block-top">
            <div className="image-file-attach__reorder-headline">
              <h3 className="image-file-attach__reorder-block-title">첨부 이미지 순서</h3>
            </div>
            {rows.length > 0 && (
              <div className="image-file-attach__reorder-hint-row">
                {rows.length >= 2 ? (
                  <p className="image-file-attach__reorder-hint">
                    아래 핸들을 <strong>드래그</strong>하여 이미지 <strong>순서</strong>를 바꿀 수 있어요
                  </p>
                ) : (
                  <span className="image-file-attach__reorder-hint" aria-hidden="true" />
                )}
                <span className="image-file-attach__reorder-total">
                  총{" "}
                  {totalSizeBytes > 0
                    ? formatFileSize(totalSizeBytes)
                    : "—"}
                </span>
              </div>
            )}
          </div>
          <ol className="image-file-attach__list" aria-label="첨부된 이미지">
            {rows.map((row: ImageFileUnifiedRow, index: number) => (
              <li
                key={row.kind === "server" ? `srv-${row.fileId}` : row.id}
                data-reorder-index={index}
                className={[
                  "image-file-attach__row",
                  "image-file-attach__row--reorder",
                  overIndex === index &&
                  reorderFromIndex != null &&
                  reorderFromIndex !== index
                    ? "image-file-attach__row--over"
                    : "",
                  reorderFromIndex === index ? "image-file-attach__row--dragging" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <AttachRowBody
                  fileName={row.kind === "server" ? row.name : row.file.name}
                  sizeLabel={
                    row.kind === "server"
                      ? row.sizeBytes != null
                        ? formatFileSize(row.sizeBytes)
                        : "?"
                      : formatFileSize(row.file.size)
                  }
                  onHandlePointerDown={handleReorderHandlePointerDown(index)}
                  trailing={
                    <button
                      type="button"
                      className="image-file-attach__remove"
                      onClick={() => removeAt(index)}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      ×
                    </button>
                  }
                />
              </li>
            ))}
          </ol>
        </div>
      )}
      <ReorderGhostPortal ghost={reorderGhost} />
    </div>
  );
}
