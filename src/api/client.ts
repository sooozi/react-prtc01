import axios, { type AxiosInstance } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

/**
 * API 요청에 공통으로 쓰는 axios 인스턴스
 *
 * - 서버 주소(base URL), JSON 헤더(Content-Type)는 여기 한 곳에서만 설정
 * - boardApi, userApi 등에서는 이 apiClient를 import해서
 *   경로(예: /posts)와 파라미터만 넘겨서 사용
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
