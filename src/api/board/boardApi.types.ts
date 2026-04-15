/**
 * 게시판 API 전용 타입
 */

/** POST /posts — 백엔드: multipart/form-data (title, content, 첨부는 File) */
export type CreatePostRequest = {
  title: string;
  content: string;
  /** multipart `attachFileList` 필드로 각 파일 append */
  attachFiles?: File[];
};

/** PUT /posts/{postNumber} — 등록과 동일하게 multipart (title, content, attachFileList[]) */
export type UpdatePostRequest = {
  title: string;
  content: string;
  attachFiles?: File[];
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

/** GET /posts/{id}/files 한 건 (Swagger: fileId, fileName, sortOrder) */
export type PostAttachmentItem = {
  fileId: number;
  fileName: string;
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
