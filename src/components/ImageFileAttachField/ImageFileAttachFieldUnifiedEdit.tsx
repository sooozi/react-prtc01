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
  const [fileAddNoticeMessage, setFileAddNoticeMessage] = useState("");
  const fileAddNoticeClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [reorderGhost, setReorderGhost] = useState<ReorderGhostState | null>(null);
  const reorderGhostRef = useRef<ReorderGhostState | null>(null);
  const ghostMoveRafRef = useRef<number | null>(null);
  const pendingGhostPointerRef = useRef<{ x: number; y: number } | null>(null);

  // 순서 드래그 중에도 이전 목록과 현재 목록을 바꾸는 함수를 쓰게 ref에 계속 맞춤
  useLayoutEffect(() => {
    rowsRef.current = rows;
    onRowsChangeRef.current = onRowsChange;
  }, [rows, onRowsChange]);

  // 이 블록이 사라질 때(뒤로 가기 등) 드래그 때문에 화면 전체에 걸어 둔 리스너를 떼 줌
  useEffect(() => {
    return () => {
      pointerReorderDetachRef.current?.();
      pointerReorderDetachRef.current = null;
    };
  }, []);

  // 드래그 고스트 초기화
  const clearReorderGhost = () => {
    if (ghostMoveRafRef.current != null) {
      cancelAnimationFrame(ghostMoveRafRef.current);
      ghostMoveRafRef.current = null;
    }
    pendingGhostPointerRef.current = null;
    reorderGhostRef.current = null;
    setReorderGhost(null);
  };

  // 드래그 고스트 시각적 초기화
  const clearReorderVisual = () => {
    clearReorderGhost();
    reorderFromRef.current = null;
    overIndexRef.current = null;
    setReorderFromIndex(null);
    setOverIndex(null);
  };

  // 드래그 고스트 이동 예약
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

  // 드래그 고스트 위치 업데이트
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

  // 드래그 고스트 세션 바인딩
  const bindPointerReorderSession = (startIndex: number, pointerId: number) => {
    pointerReorderDetachRef.current?.();

    document.body.classList.add("image-file-attach--reorder-active");

    reorderFromRef.current = startIndex;
    overIndexRef.current = null;
    setReorderFromIndex(startIndex);
    setOverIndex(null);

    let ended = false;

    /** 손가락/마우스 움직임(pointermove)마다 불리며 스크롤을 막지 않는다고 표시(passive) */
    const moveOpts: AddEventListenerOptions = { passive: true };

    // 드래그 고스트 세션 종료 함수
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

    // 드래그 고스트 이동 시 이벤트 핸들러
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      scheduleReorderGhostMove(ev.clientX, ev.clientY);
      updateOverFromPoint(ev.clientX, ev.clientY);
    };

    // 드래그 고스트 세션 종료 함수
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

    document.addEventListener("pointermove", onMove, moveOpts); // 드래그 고스트 이동 시 이벤트 핸들러
    document.addEventListener("pointerup", onUp, true); // 손·버튼을 뗐을 때(정상 종료)
    document.addEventListener("pointercancel", onUp, true); // 포인터가 끊겼을 때(터치 취소·방해 등)
  };

  // 드래그 고스트 핸들 클릭 시 처리
  const handleReorderHandlePointerDown =
    (index: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return; // 마우스 오른쪽 버튼 클릭 시 처리
      if (rows.length < 2) return; // 첨부 이미지가 2개 미만인 경우 처리
      e.preventDefault();
      e.stopPropagation(); // 이벤트 버블링 방지
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

  /** 안내 메시지를 9초 뒤에 비우도록 예약(이전 예약은 취소) */
  const scheduleFileAddNoticeClear = () => {
    if (fileAddNoticeClearTimeoutRef.current)
      clearTimeout(fileAddNoticeClearTimeoutRef.current);
    fileAddNoticeClearTimeoutRef.current = setTimeout(() => {
      setFileAddNoticeMessage("");
      fileAddNoticeClearTimeoutRef.current = null;
    }, 9000);
  };

  /** 언마운트 시 안내 메시지 자동 지움 타이머 정리 */
  useEffect(() => {
    return () => {
      if (fileAddNoticeClearTimeoutRef.current) {
        clearTimeout(fileAddNoticeClearTimeoutRef.current);
      }
    };
  }, []);

  // 로컬 File.size + 서버 API의 sizeBytes(있을 때만 합산)
  const totalSizeBytes = useMemo(
    () =>
      rows.reduce((sum: number, r: ImageFileUnifiedRow) => {
        if (r.kind === "local") return sum + r.file.size;
        return sum + (r.sizeBytes ?? 0);
      }, 0),
    [rows]
  );

  // 파일 추가 시 처리
  const onFilesAdded = (files: File[]) => {
    if (files.length === 0) return;

    const okLength: File[] = []; // 이름 길이를 통과한 파일 목록
    const tooLong: File[] = []; // 이름 길이를 초과한 파일 목록
    for (const f of files) {
      if (f.name.length > MAX_ATTACHMENT_FILENAME_LENGTH) tooLong.push(f);
      else okLength.push(f);
    }

    // 파일 추가 안내 메시지 문장 조각
    const messageParts: string[] = [];

    // 파일 이름 길이 초과 시 처리
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

    // 이름 길이를 통과한 파일이 하나도 없으면 목록은 바꾸지 않고 안내 메시지만 보여 주고 끝
    if (okLength.length === 0) {
      if (messageParts.length > 0) {
        setFileAddNoticeMessage(messageParts.join(" "));
        scheduleFileAddNoticeClear();
      }
      return;
    }

    // 현재 목록에서 로컬 파일과 서버 파일 분리
    const currentItems: FileWithId[] = rows
      .filter((r): r is Extract<ImageFileUnifiedRow, { kind: "local" }> => r.kind === "local")
      .map((r) => ({ id: r.id, file: r.file }));

    // 기존 첨부 파일 목록
    const previous: ImageFilePreviousEntry[] = rows
      .filter((r): r is Extract<ImageFileUnifiedRow, { kind: "server" }> => r.kind === "server")
      .map((r) => ({ id: r.fileId, name: r.name }));

    const { add, skip } = partitionByAttachmentIdentity(okLength, currentItems, previous);

    // 이미 있는 파일 목록
    if (skip.length > 0) {
      const list =
        skip.length === 1
          ? `“${skip[0]!.name.length > 50 ? `${skip[0]!.name.slice(0, 50)}…` : skip[0]!.name}”`
          : `(${skip.length}개)`;
      messageParts.push(
        `같은 파일명(확장자는 소문자로 비교)이 이미 있어 추가하지 않았습니다. ${list}`
      );
    }
    
    // 이름 길이를 통과한 파일이 하나라도 있으면 목록을 바꾸고 추가
    if (add.length > 0) {
      const newLocals = filesToItemsWithIds(add).map((it) => ({
        kind: "local" as const,
        id: it.id,
        file: it.file,
      }));
      onRowsChange([...rows, ...newLocals]);
    }
    // 누적된 안내 문장이 있으면 표시 후 자동 지움 예약
    if (messageParts.length > 0) {
      setFileAddNoticeMessage(messageParts.join(" "));
      scheduleFileAddNoticeClear();
    }
  };

  // 파일 추가 시 처리
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list) onFilesAdded(filterImageFiles(list));
    e.target.value = "";
  };

  // 파일 삭제 시 처리
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

      {fileAddNoticeMessage && (
        <p className="image-file-attach__add-notice-message" role="alert">
          {fileAddNoticeMessage}
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
                  sizeLabel={ // 파일 크기 레이블
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
