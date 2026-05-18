import type { RefObject } from "react";

/** 파일 한 건 (id: 고유 식별자, file: 파일 객체) */
export type FileWithId = { id: string; file: File };

/** 서버에 이미 있는 첨부(읽기 전용 목록) — id는 리스트 `key`용 */
export type ImageFilePreviousEntry = {
  id: string | number;
  name: string;
  /** API에 있으면 표시, 없으면 "—" */
  sizeBytes?: number;
};

/**
 * 게시글 수정: 서버 첨부 + 새로 고른 파일을 한 줄 목록에서 순서 변경·삭제할 때 사용.
 * 저장 시 `attachFileOrderList`는 등록 API와 같이 파일명(확장자 포함) 기준으로 맞추는 경우가 많습니다(Update 페이지).
 */
export type ImageFileUnifiedRow =
  | { kind: "server"; fileId: number; name: string; sizeBytes?: number }
  | { kind: "local"; id: string; file: File };

type ImageFileAttachFieldBaseProps = {
  fileInputId: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  accept?: string;
  rootClassName?: string;
};

/** 글쓰기 등 — 새로 고른 파일만 목록 */
export type ImageFileAttachFieldCreateProps = ImageFileAttachFieldBaseProps & {
  items: FileWithId[];
  onChange: (items: FileWithId[]) => void;
};

/** 게시글 수정: 서버 첨부 + 신규를 한 목록에서 순서·삭제 */
export type ImageFileAttachFieldUnifiedProps = ImageFileAttachFieldBaseProps & {
  unifiedRows: ImageFileUnifiedRow[];
  onUnifiedRowsChange: (rows: ImageFileUnifiedRow[]) => void;
};

export type ImageFileAttachFieldProps =
  | ImageFileAttachFieldCreateProps
  | ImageFileAttachFieldUnifiedProps;
