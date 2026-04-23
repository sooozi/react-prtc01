/** 파일 한 건 (id: 고유 식별자, file: 파일 객체) */
export type FileWithId = { id: string; file: File };

/** 서버에 이미 있는 첨부(읽기 전용 목록) — id는 리스트 `key`용 */
export type ImageFilePreviousEntry = {
  id: string | number;
  name: string;
  /** API에 있으면 표시, 없으면 "—" */
  sizeBytes?: number;
};
