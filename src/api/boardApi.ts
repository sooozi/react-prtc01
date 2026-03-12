import axios from "axios";
import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// 화면에서 사용하는 게시글 아이템 타입 (GET /posts API 응답 기준)
export type BoardPostItem = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
};

// GET /posts API 응답의 게시글 한 건
type PostDto = {
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
};

// GET /posts API 응답 데이터 타입
type PostsResponseData = {
  itemSize: number;
  pageSize: number;
  totalItemSize: number;
  data: PostDto[];
};

// 포스트 목록 조회 요청 파라미터 타입
type SelectBoardListParams = {
  page: number;
  size: number;
};

// PostDto를 BoardPostItem(화면용 한 건)으로 변환
// 등록자: API 필드 rgtrInfo 사용
function mapPostToItem(dto: PostDto): BoardPostItem {
  return {
    id: dto.postNumber,
    title: dto.title,
    author: dto.rgtrInfo ?? "-",
    createdAt: dto.regDt,
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

/**
 * 포스트 목록 조회
 * [GET] /posts
 * 로그인 토큰이 있으면 Authorization 헤더로 전달. 401 시 BoardApiError(status: 401) throw.
 */
export async function selectBoardList({ page, size }: SelectBoardListParams) {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await apiClient.get<ApiResponse<PostsResponseData>>("/posts", {
      params: { page, size },
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const raw = res.data.data;
    const data: BoardPostItem[] = (raw?.data ?? []).map(mapPostToItem);

    return {
      data: {
        data,
        totalItemSize: raw?.totalItemSize ?? 0,
        itemSize: raw?.itemSize ?? data.length,
        pageSize: raw?.pageSize ?? size,
      },
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

/** POST /posts 요청 body */
export type CreatePostRequest = {
  title: string;
  content: string;
};

// GET /posts/{id} 상세 조회 응답 데이터 (Swagger 스펙 기준)
type PostDetailDto = {
  postNumber: number;
  ownerUserId?: string;
  title: string;
  content?: string;
  searchContent?: string;
  ingCnt?: number;
  regDt: string;
  rgtrId?: string;
  rgtrName?: string;
  rgtrInfo?: string;
  mdfcnDt?: string;
  mdfcrId?: string;
  mdfcrName?: string;
  mdfcrInfo?: string;
};

/** 화면에서 사용하는 포스트 상세 타입 */
export type PostDetailItem = {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  /** 작성자 사용자 ID (수정 버튼 노출 여부 판단용) */
  ownerUserId?: string;
};

/**
 * 포스트 상세 조회
 * [GET] /posts/{postNumber}
 * 401 시 BoardApiError(status: 401) throw.
 */
export async function getPostDetail(postNumber: number): Promise<PostDetailItem> {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await apiClient.get<ApiResponse<PostDetailDto>>(
      `/posts/${postNumber}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    const d = res.data.data;
    return {
      id: d.postNumber,
      title: d.title,
      content: d.content ?? "",
      author: d.rgtrInfo ?? "-",
      createdAt: d.regDt,
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
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    throw new BoardApiError(
      "인증이 필요합니다. 로그인 후 다시 시도해주세요.",
      401
    );
  }

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

/** PUT /posts/{postNumber} 요청 body (수정 가능 항목: title, content) */
export type UpdatePostRequest = {
  title: string;
  content: string;
};

/**
 * 포스트 수정
 * [PUT] /posts/{postNumber}
 * 인증 토큰 필수. 401 시 BoardApiError(status: 401) throw.
 */
export async function updatePost(
  postNumber: number, // 게시글 번호
  body: UpdatePostRequest // 수정 요청 바디
): Promise<void> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    throw new BoardApiError(
      "인증이 필요합니다. 로그인 후 다시 시도해주세요.",
      401
    );
  }

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
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    throw new BoardApiError(
      "인증이 필요합니다. 로그인 후 다시 시도해주세요.",
      401
    );
  }

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