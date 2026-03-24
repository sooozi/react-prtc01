import { ApiError } from "@/api/errors";
import { api } from "@/api/http";
import type {
  BoardPostItem,
  CreatePostRequest,
  PostDetailDto,
  PostDetailItem,
  PostDto,
  PostsResponseData,
  SelectBoardListParams,
  UpdatePostRequest,
} from "@/api/boardApi.types";

export type {
  BoardPostItem,
  CreatePostRequest,
  PostDetailItem,
  SortOrder,
  UpdatePostRequest,
} from "@/api/boardApi.types";

/** 페이지에서 기존처럼 `instanceof BoardApiError` 쓰기 — ApiError와 동일 클래스 */
export { ApiError as BoardApiError };

// PostDto를 BoardPostItem(화면용 한 건)으로 변환
function mapPostToItem(dto: PostDto): BoardPostItem {
  return {
    id: dto.postNumber,
    title: dto.title,
    author: dto.rgtrInfo ?? "-",
    createdAt: dto.regDt,
    viewCount: dto.inqCnt ?? 0,
  };
}

// 인증 필수 API용: 토큰 없으면 ApiError(401) throw (서버 왕복 없이 차단)
function getAuthTokenOrThrow(): string {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    throw new ApiError("인증이 필요합니다. 로그인 후 다시 시도해주세요.", {
      status: 401,
    });
  }
  return token;
}

/**
 * 포스트 목록 조회
 * [GET] /posts
 * 토큰이 있으면 client request interceptor가 Authorization 부착.
 */
export async function selectBoardList({
  page,
  size,
  sortColumnName,
  sortType,
  titleSearchKeyword,
  rgtrIdSearchKeyword,
  rgtrNameSearchKeyword,
}: SelectBoardListParams) {
  const titleKw = titleSearchKeyword?.trim();
  const rgtrIdKw = rgtrIdSearchKeyword?.trim();
  const rgtrNameKw = rgtrNameSearchKeyword?.trim();

  const json = await api.get<PostsResponseData>("/posts", {
    params: {
      page,
      size,
      sortColumnName,
      sortType,
      ...(titleKw && { titleSearchKeyword: titleKw }),
      ...(rgtrIdKw && { rgtrIdSearchKeyword: rgtrIdKw }),
      ...(rgtrNameKw && { rgtrNameSearchKeyword: rgtrNameKw }),
    },
  });

  const raw = json.data;
  const data: BoardPostItem[] = (raw?.data ?? []).map(mapPostToItem);

  return {
    data: {
      data,
      totalItemSize: raw?.totalItemSize ?? 0,
      itemSize: raw?.itemSize ?? data.length,
      pageSize: raw?.pageSize ?? size,
    },
  };
}

/**
 * 포스트 상세 조회
 * [GET] /posts/{postNumber}
 */
export async function getPostDetail(postNumber: number): Promise<PostDetailItem> {
  const json = await api.get<PostDetailDto>(`/posts/${postNumber}`);
  const d = json.data;
  if (d == null) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }
  return {
    id: d.postNumber,
    title: d.title,
    content: d.content ?? "",
    author: d.rgtrInfo ?? "-",
    createdAt: d.regDt,
    viewCount: d.inqCnt ?? 0,
    ownerUserId: d.ownerUserId,
  };
}

/**
 * 포스트 등록
 * [POST] /posts
 * 인증 토큰 필수.
 */
export async function createPost(body: CreatePostRequest) {
  getAuthTokenOrThrow();
  return api.post<number, CreatePostRequest>("/posts", body);
}

/**
 * 포스트 수정
 * [PUT] /posts/{postNumber}
 * 인증 토큰 필수.
 */
export async function updatePost(
  postNumber: number,
  body: UpdatePostRequest
): Promise<void> {
  getAuthTokenOrThrow();
  await api.put<unknown, UpdatePostRequest>(`/posts/${postNumber}`, body);
}

/**
 * 포스트 삭제
 * [DELETE] /posts/{postNumber}
 * 인증 토큰 필수.
 */
export async function deletePost(postNumber: number): Promise<void> {
  getAuthTokenOrThrow();
  await api.delete<unknown>(`/posts/${postNumber}`);
}

/**
 * 포스트 조회수 증가
 * [PATCH] /posts/{postNumber}/view_count
 * 인증 토큰 필수.
 */
export async function viewCountUp(postNumber: number): Promise<void> {
  getAuthTokenOrThrow();
  await api.patch<unknown>(`/posts/${postNumber}/view_count`, undefined);
}