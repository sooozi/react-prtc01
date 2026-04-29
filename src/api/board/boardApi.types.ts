/**
 * 게시판 API 전용 타입
 */

/** POST /posts — 백엔드: multipart/form-data (title, content, 첨부는 File) */
export type CreatePostRequest = {
  title: string;
  content: string;
  /** multipart `attachFileList` 필드로 각 파일 append */
  attachFiles?: File[]; // 첨부 파일 목록
  attachFileOrderList?: string[]; // 첨부 파일 순서 목록
};

/**
 * PUT /posts/{postNumber} — multipart/form-data
 * Swagger: addAttachFileList, deleteFileIdList, attachFileOrderList
 */
export type UpdatePostRequest = {
  title: string;
  content: string;
  /** multipart `addAttachFileList` — 이번 요청에서 새로 올리는 파일 */
  addAttachFiles?: File[];
  /** 삭제할 기존 첨부의 fileId */
  deleteFileIdList?: number[];
  /**
   * 최종 노출 순서. 기존 파일은 보통 `fileId` 문자열, 신규는 업로드 파일명(확장자 포함).
   * 백엔드가 다른 토큰 규칙을 쓰면 이 배열만 맞추면 됩니다.
   */
  attachFileOrderList?: string[];
};

/** GET /posts 목록의 게시글 한 건 (조회수: inqCnt) */
export type Post = {
  postNumber: number;
  ownerUserId?: string;
  title: string;
  regDt: string;
  rgtrId?: string;
  rgtrName?: string;
  rgtrInfo?: string;
  mdfcnDt?: string;
  mdfrId?: string;
  mdfrName?: string;
  mdfrInfo?: string;
  attachFileList?: string[];
  inqCnt?: number;
};

/** GET /posts 목록 응답 본문 (페이지 메타 + rows) */
export type PostListResponse = {
  itemSize: number;
  pageSize: number;
  totalItemSize: number;
  data: Post[];
};

/** 목록 정렬 방향 (쿼리 sortType: ASC / DESC) */
export type SortOrder = "ASC" | "DESC";

/** 목록 조회 요청 파라미터 (GET /posts 쿼리, Swagger와 동일한 필드명) */
export type SelectBoardList = {
  page: number;
  size: number;
  titleSearchKeyword?: string;  
  rgtrIdSearchKeyword?: string;
  rgtrNameSearchKeyword?: string;
  sortColumnName?: string;
  sortType?: SortOrder;
};

/** GET /posts/{id}/files 한 건 (Swagger: fileId, fileName, fileSize, sortOrder) */
export type PostAttachmentItem = {
  fileId: number;
  fileName: string;
  /** 바이트 단위 — 없으면 UI에서 생략 */
  fileSize?: number;
  sortOrder: number;
};

/** GET /posts/{id} 상세 응답 (조회수: inqCnt) */
export type PostDetail = {
  postNumber: number;
  ownerUserId?: string;
  title: string;
  content?: string;
  attachFileList?: string[];
  inqCnt?: number;
  regDt: string;
  rgtrId?: string;
  rgtrName?: string;
  rgtrInfo?: string;
  mdfcnDt?: string;
  mdfcrId?: string;
  mdfcrName?: string;
  mdfcrInfo?: string;
};
