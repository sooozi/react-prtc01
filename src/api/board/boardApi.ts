import { apiClient } from "../http/client";
import { getAuthTokenOrThrow } from "../auth/authToken";
import { ApiError } from "../http/errors";
import { api } from "../http/http";
import type { ApiResponse } from "../http/types";
import type {
  CreatePostRequest,
  Post,
  PostDetail,
  PostListResponse,
  SelectBoardList,
  UpdatePostRequest,
} from "./boardApi.types";

export type {
  CreatePostRequest,
  Post,
  PostDetail,
  PostListResponse,
  SortOrder,
  UpdatePostRequest,
} from "./boardApi.types";

/** 페이지에서 기존처럼 `instanceof BoardApiError` 쓰기 — ApiError와 동일 클래스 */
export { ApiError as BoardApiError };

/**
 * 포스트 목록 조회 & 검색
 * [GET] /posts
 */
export async function selectBoardList(params: SelectBoardList) {
  //trim된 문자열
  const titleKw = params.titleSearchKeyword?.trim();
  const rgtrIdKw = params.rgtrIdSearchKeyword?.trim();
  const rgtrNameKw = params.rgtrNameSearchKeyword?.trim();

  const json = await api.get<PostListResponse>("/posts", {
    params: {
      page: params.page,
      size: params.size,
      sortColumnName: params.sortColumnName,
      sortType: params.sortType,
      ...(titleKw && { titleSearchKeyword: titleKw }), //titleKw가 있으면 titleSearchKeyword에 titleKw를 설정
      ...(rgtrIdKw && { rgtrIdSearchKeyword: rgtrIdKw }),
      ...(rgtrNameKw && { rgtrNameSearchKeyword: rgtrNameKw }),
    },
  });

  const raw = json.data;
  // raw.data가 있으면 raw.data를 반환, 없으면 []를 반환
  const data: Post[] = raw?.data ?? [];

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
export async function getPostDetail(postNumber: number): Promise<PostDetail> {
  const json = await api.get<PostDetail>(`/posts/${postNumber}`);
  const d = json.data;
  if (d == null) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }
  return d;
}

/**
 * 포스트 등록
 * [POST] /posts
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
  getAuthTokenOrThrow(); // 인증 토큰 필수
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

/**
 * 내가 작성한 포스트 목록 조회
 * [GET] /posts/me?userId=...
 */
export async function getMyPostList(userId: string): Promise<Post[]> {
  getAuthTokenOrThrow();
  const json = await api.get<Post[]>(`/posts/me`, {
    params: { userId },
  });
  return json.data ?? [];
}