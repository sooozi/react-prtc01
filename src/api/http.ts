import type { AxiosRequestConfig } from "axios";
import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";

/**
 * HTTP 메서드별 얇은 래퍼 — 도메인 API(boardApi, login 등)는 apiClient 대신 여기만 사용.
 * 응답 본문(JSON)은 백엔드 ApiResponse 형이므로 `.data`까지 풀어서 반환해 `res.data.data` 중복을 줄임.
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
