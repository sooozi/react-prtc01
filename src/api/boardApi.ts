import { apiClient } from "@/api/client";
import { ApiError } from "@/api/errors";
import { api } from "@/api/http";
import type { ApiResponse } from "@/api/types";
import type {
  BoardPostItem,
  CreatePostRequest,
  PostDetailDto,
  PostDetailItem,
  PostDto,
  PostsResponseData,
  SelectBoardList,
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

// 서버 데이터를 BoardPostItem(화면용 데이터)으로 변환
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
 */
export async function selectBoardList(params: SelectBoardList) {
  const json = await api.get<PostsResponseData>("/posts", {
    params,
  });

  const raw = json.data; // 서버에서 받은 데이터
  //data는 “BoardPostItem 배열”
  const data: BoardPostItem[] = (raw?.data ?? []).map(mapPostToItem);

  return {
    data: {
      data,
      itemSize: raw?.itemSize ?? data.length,
      pageSize: raw?.pageSize ?? params.size,
      totalItemSize: raw?.totalItemSize ?? 0,
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
 * 스웨거에서 `request`가 (query)로 보이는 경우, Spring은 JSON 본문이 아니라
 * 쿼리/폼 파라미터로 바인딩하는 경우가 많음 → JSON만 보내면 title·content가 비어 400이 남.
 */
export async function createPost(body: CreatePostRequest) {
  getAuthTokenOrThrow();
  const form = new URLSearchParams();
  form.set("title", body.title);
  form.set("content", body.content);
  const res = await apiClient.post<ApiResponse<number>>("/posts", form.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
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
  const form = new URLSearchParams();
  form.set("title", body.title);
  form.set("content", body.content);
  await apiClient.put<ApiResponse<unknown>>(`/posts/${postNumber}`, form.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
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