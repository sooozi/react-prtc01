import type { AxiosRequestConfig } from "axios";
import { apiClient } from "./client";
import type { ApiResponse } from "./types";

/**
 * axios(get/post/…)를 메서드마다 한 번씩 감싼 얇은 모음
 *
 * - 게시판·로그인 같은 도메인 코드는 보통 `apiClient`가 아니라 여기(`api`)만 사용
 * - axios는 성공 시 `{ data: 서버JSON, status, headers, … }` 전체를 주는데,
 *   여기서는 그중 서버가 보낸 JSON(`response.data`)만 돌려줍니다.
 *   그래서 호출하는 쪽에서 `응답.data.data`처럼 `.data`를 두 번 안 적어도 됨!
 */
export const api = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.get<ApiResponse<T>>(url, config).then((res) => res.data);
  },

  //포스트 등록
  post<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return apiClient
      .post<ApiResponse<T>>(url, body, config)
      .then((res) => res.data);
  },

  //포스트 수정
  put<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return apiClient
      .put<ApiResponse<T>>(url, body, config)
      .then((res) => res.data);
  },

  //포스트 조회수 증가
  patch<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return apiClient
      .patch<ApiResponse<T>>(url, body, config)
      .then((res) => res.data);
  },

  //포스트 삭제
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.delete<ApiResponse<T>>(url, config).then((res) => res.data);
  },
};
