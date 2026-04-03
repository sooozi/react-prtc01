/**
 * 게시판 API 전용 타입
 */

/** POST /posts 요청 body */
export type CreatePostRequest = {
  title: string;
  content: string;
};

/** PUT /posts/{postNumber} 요청 body (수정 가능: title, content) */
export type UpdatePostRequest = {
  title: string;
  content: string;
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

/** GET /posts/{id} 상세 응답 (조회수: inqCnt) */
export type PostDetail = {
  postNumber: number;
  ownerUserId?: string;
  title: string;
  content?: string;
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
