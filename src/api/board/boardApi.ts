import { reportApiErrorToUser } from "../http/apiErrorDisplay";
import { apiClient } from "../http/client";
import { getAuthTokenOrThrow } from "../auth/authToken";
import { ApiError } from "../http/errors";
import { api } from "../http/http";
import type { ApiResponse } from "../http/types";
import type {
  CreatePostRequest,
  CreateCommentRequest,
  CreateCommentResponse,
  Post,
  PostAttachmentItem,
  PostDetail,
  PostListResponse,
  SelectBoardList,
  SelectCommentListParams,
  UpdatePostRequest,
  CommentListItem,
  UpdateCommentRequest,
  UpdateCommentResponse,
  CommentReactionType,
  CommentReactionResponse,
} from "./boardApi.types";

export type {
  CreatePostRequest,
  CreateCommentRequest,
  CreateCommentResponse,
  Post,
  PostAttachmentItem,
  PostDetail,
  PostListResponse,
  SortOrder,
  UpdatePostRequest,
  UpdateCommentRequest,
  UpdateCommentResponse,
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
 * 실패 시 `reportApiErrorToUser` 후 `null`
 */
export async function getPostDetail(postNumber: number): Promise<PostDetail | null> {
  try {
    const json = await api.get<PostDetail>(`/posts/${postNumber}`);
    const d = json.data;
    if (d == null) {
      reportApiErrorToUser(new Error("게시글을 찾을 수 없습니다."));
      return null;
    }
    return d;
  } catch (e) {
    reportApiErrorToUser(e);
    return null;
  }
}

/**
 * 포스트 등록 (게시글 + 파일 업로드)
 * [POST] /posts — multipart/form-data (title, content, attachFileList[])
 * 실패 시 `reportApiErrorToUser` 후 `null`
 */
export async function createPost(body: CreatePostRequest): Promise<ApiResponse<number> | null> {
  try {
    getAuthTokenOrThrow();
    const formData = new FormData();
    formData.append("title", body.title);
    formData.append("content", body.content);
    for (const file of body.attachFiles ?? []) {
      formData.append("attachFileList", file);
    }
    for (const name of body.attachFileOrderList ?? []) {
      formData.append("attachFileOrderList", name);
    }
    const res = await apiClient.post<ApiResponse<number>>("/posts", formData, {
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete (headers as Record<string, unknown>)["Content-Type"];
          }
          return data;
        },
      ],
    });
    return res.data;
  } catch (e) {
    reportApiErrorToUser(e);
    return null;
  }
}

/**
 * 포스트 수정
 * [PUT] /posts/{postNumber} — multipart/form-data
 */
export async function updatePost(postNumber: number, body: UpdatePostRequest): Promise<boolean> {
  try {
    getAuthTokenOrThrow();
    const formData = new FormData();
    formData.append("title", body.title);
    formData.append("content", body.content);
    for (const file of body.addAttachFiles ?? []) {
      // 새로 추가한 파일
      formData.append("addAttachFileList", file);
    }
    for (const id of body.deleteFileIdList ?? []) {
      // 삭제할 파일
      formData.append("deleteFileIdList", String(id));
    }
    for (const name of body.attachFileOrderList ?? []) {
      formData.append("attachFileOrderList", name);
    }
    await apiClient.put<unknown>(`/posts/${postNumber}`, formData, {
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete (headers as Record<string, unknown>)["Content-Type"];
          }
          return data;
        },
      ],
    });
    return true;
  } catch (e) {
    reportApiErrorToUser(e);
    return false;
  }
}

/**
 * 포스트 삭제
 * [DELETE] /posts/{postNumber}
 * 실패 시 `reportApiErrorToUser` 후 `false`
 */
export async function deletePost(postNumber: number): Promise<boolean> {
  try {
    getAuthTokenOrThrow();
    await api.delete<unknown>(`/posts/${postNumber}`);
    return true;
  } catch (e) {
    reportApiErrorToUser(e);
    return false;
  }
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
 * 실패 시 `reportApiErrorToUser` 후 `null`
 */
export async function getMyPostList(userId: string): Promise<Post[] | null> {
  try {
    getAuthTokenOrThrow();
    const json = await api.get<Post[]>(`/posts/me`, {
      params: { userId },
    });
    return json.data ?? [];
  } catch (e) {
    reportApiErrorToUser(e);
    return null;
  }
}

/**
 * 포스트 상세 첨부파일 목록 조회
 * [GET] /posts/{id}/files
 */
export async function getPostFiles(postNumber: number): Promise<PostAttachmentItem[]> {
  getAuthTokenOrThrow();
  const json = await api.get<PostAttachmentItem[]>(`/posts/${postNumber}/files`);
  return json.data ?? [];
}

/**
 * 게시글 첨부 파일 바이너리 (브라우저 미리보기용).
 * 목록 API `GET /posts/{id}/files`와 쌍을 이루는 단건 조회 경로로 가정합니다.
 * Swagger 경로가 다르면(예: `…/files/{fileId}/download`) 이 함수의 URL만 맞춰 주세요.
 */
export async function getPostFileBlob(postNumber: number, fileId: number): Promise<Blob> {
  getAuthTokenOrThrow();
  const res = await apiClient.get<Blob>(`/posts/${postNumber}/files/${fileId}`, {
    responseType: "blob",
  });
  return res.data;
}

/** 댓글 작성 성공 시 백엔드 resultCode (로그인·게시판과 동일 코드) */
export const COMMENT_SUCCESS_CODE = "BPLTE200" as const;

/**
 * 댓글 작성
 * [POST] /comments — application/json
 */
export async function createComment(
  body: CreateCommentRequest,
): Promise<ApiResponse<CreateCommentResponse> | null> {
  try {
    getAuthTokenOrThrow(); // 로그인 필수
    return await api.post<CreateCommentResponse, CreateCommentRequest>("/comments", body);
  } catch (e) {
    reportApiErrorToUser(e);
    return null;
  }
}

/**
 * 댓글 목록 조회
 * [GET] /comments?postNumber={postNumber}
 */
export async function selectCommentList(
  params: SelectCommentListParams,
): Promise<CommentListItem[] | null> {
  try {
    getAuthTokenOrThrow();
    const json = await api.get<CommentListItem[]>("/comments", {
      params: {
        postNumber: params.postNumber,
        ...(params.commentId != null && { commentId: params.commentId }),
      },
    });

    if (json.resultCode !== COMMENT_SUCCESS_CODE) {
      reportApiErrorToUser(new Error(json.resultMessage ?? "댓글 목록을 불러오지 못했습니다."));
      return null;
    }

    return json.data ?? [];
  } catch (e) {
    reportApiErrorToUser(e);
    return null;
  }
}

/**
 * 댓글 삭제
 * [DELETE] /comments/{commentId}
 */
export async function deleteComment(commentId: number): Promise<boolean> {
  try {
    getAuthTokenOrThrow();
    await api.delete<unknown>(`/comments/${commentId}`);
    return true;
  } catch (e) {
    reportApiErrorToUser(e);
    return false;
  }
}

/**
 * 댓글 수정
 * [PUT] /comments/{commentId} — application/json
 */
export async function updateComment(
  commentId: number,
  body: UpdateCommentRequest,
): Promise<ApiResponse<UpdateCommentResponse> | null> {
  try {
    getAuthTokenOrThrow(); // 로그인 필수 (토큰 없으면 여기서 throw)
    return await api.put<UpdateCommentResponse, UpdateCommentRequest>(
      `/comments/${commentId}`,
      body,
    );
  } catch (e) {
    reportApiErrorToUser(e);
    return null;
  }
}

/**
 * 댓글 반응
 * [PATCH] /comments/{commentId}/reaction
 */
export async function reactToComment(
  commentId: number,
  reactionType: CommentReactionType,
): Promise<ApiResponse<CommentReactionResponse> | null> {
  try {
    getAuthTokenOrThrow();
    return await api.patch<CommentReactionResponse>(`/comments/${commentId}/reaction`, undefined, {
      params: { reactionType },
    });
  } catch (e) {
    reportApiErrorToUser(e);
    return null;
  }
}
