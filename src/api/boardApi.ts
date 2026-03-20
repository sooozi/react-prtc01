import axios from "axios";
import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
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

export type { BoardPostItem, CreatePostRequest, PostDetailItem, UpdatePostRequest } from "@/api/boardApi.types";

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

// 401 등 HTTP 상태를 담아 던질 때 사용
export class BoardApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "BoardApiError";
    this.status = status;
  }
}

// 로그인 토큰 가져오기 (없으면 null)
function getAuthToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

// 인증 필수 API용: 토큰 없으면 BoardApiError(401) throw
function getAuthTokenOrThrow(): string {
  const token = getAuthToken();
  if (!token) {
    throw new BoardApiError(
      "인증이 필요합니다. 로그인 후 다시 시도해주세요.",
      401
    );
  }
  return token;
}

/**
 * 포스트 목록 조회
 * [GET] /posts
 * 쿼리: page, size, sortColumnName(regDt, title, inqCnt 등), sortType(ASC/DESC)
 * 로그인 토큰이 있으면 Authorization 헤더로 전달. 401 시 BoardApiError(status: 401) throw.
 */
export async function selectBoardList({
  page,
  size,
  sortColumnName,
  sortType,
}: SelectBoardListParams) {
  try {
    const token = getAuthToken();
    const res = await apiClient.get<ApiResponse<PostsResponseData>>("/posts", {
      params: { page, size, sortColumnName, sortType },
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const raw = res.data.data;
    const data: BoardPostItem[] = (raw?.data ?? []).map(mapPostToItem);

    // 응답 데이터 반환
    return {
      data: {
        data,
        totalItemSize: raw?.totalItemSize ?? 0,
        itemSize: raw?.itemSize ?? data.length,
        pageSize: raw?.pageSize ?? size,
      },
    };
  } catch (e) {
    // 401 에러 처리
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      const msg =
        (e.response?.data as { resultMessage?: string })?.resultMessage ??
        "인증이 필요합니다. 로그인 후 다시 시도해주세요.";
      throw new BoardApiError(msg, 401);
    }
    throw e;
  }
}

/**
 * 포스트 상세 조회
 * [GET] /posts/{postNumber}
 * 401 시 BoardApiError(status: 401) throw.
 */
export async function getPostDetail(postNumber: number): Promise<PostDetailItem> {
  try {
    const token = getAuthToken();
    const res = await apiClient.get<ApiResponse<PostDetailDto>>(
      `/posts/${postNumber}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    const d = res.data.data;
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
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      const msg =
        (e.response?.data as { resultMessage?: string })?.resultMessage ??
        "인증이 필요합니다. 로그인 후 다시 시도해주세요.";
      throw new BoardApiError(msg, 401);
    }
    throw e;
  }
}

/**
 * 포스트 등록
 * [POST] /posts
 * 인증 토큰 필수. 401 시 BoardApiError(status: 401) throw.
 */
export async function createPost(body: CreatePostRequest) {
  const token = getAuthTokenOrThrow();
  try {
    const res = await apiClient.post<ApiResponse<number>>("/posts", body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      const msg =
        (e.response?.data as { resultMessage?: string })?.resultMessage ??
        "인증이 필요합니다. 로그인 후 다시 시도해주세요.";
      throw new BoardApiError(msg, 401);
    }
    throw e;
  }
}

/**
 * 포스트 수정
 * [PUT] /posts/{postNumber}
 * 인증 토큰 필수. 401 시 BoardApiError(status: 401) throw.
 */
export async function updatePost(
  postNumber: number, // 게시글 번호
  body: UpdatePostRequest // 수정 요청 바디
): Promise<void> {
  const token = getAuthTokenOrThrow();
  try {
    await apiClient.put<ApiResponse<unknown>>(`/posts/${postNumber}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      const msg =
        (e.response?.data as { resultMessage?: string })?.resultMessage ??
        "인증이 필요합니다. 로그인 후 다시 시도해주세요.";
      throw new BoardApiError(msg, 401);
    }
    throw e;
  }
}
/**
 * 포스트 삭제
 * [DELETE] /posts/{postNumber}
 * 인증 토큰 필수. 401 시 BoardApiError(status: 401) throw.
 */
export async function deletePost(postNumber: number): Promise<void> {
  const token = getAuthTokenOrThrow();
  try {
    await apiClient.delete<ApiResponse<unknown>>(`/posts/${postNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      const msg =
        (e.response?.data as { resultMessage?: string })?.resultMessage ?? "인증이 필요합니다. 로그인 후 다시 시도해주세요.";
      throw new BoardApiError(msg, 401);
    }
    throw e;
  }
}

/**
 * 포스트 조회수 증가
 * [PATCH] /posts/{postNumber}/view_count
 * 인증 토큰 필수. 401 시 BoardApiError(status: 401) throw.
 */
export async function viewCountUp(postNumber: number): Promise<void> {
  const token = getAuthTokenOrThrow();
  try {
    await apiClient.patch<ApiResponse<unknown>>(
      `/posts/${postNumber}/view_count`,
      undefined,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      const msg =
        (e.response?.data as { resultMessage?: string })?.resultMessage ?? "인증이 필요합니다. 로그인 후 다시 시도해주세요.";
      throw new BoardApiError(msg, 401);
    }
    throw e;
  }
}