import axios, { type AxiosInstance } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

/**
 * 공용 API 클라이언트
 * - base URL, Content-Type 은 여기서만 설정
 * - 각 API(login, auth, boardApi)는 이 인스턴스만 사용하고 경로·파라미터만 전달
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
