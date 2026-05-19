import { api } from "../http/http";
import type { LoginFormValues } from "@/schemas/auth/loginSchema";

/** POST /auth/login body — 폼 스키마와 동일 */
export type LoginRequest = LoginFormValues;

/** 로그인 성공 시 data 안에 오는 값 */
export type LoginResponseData = {
  userId: string;
  userName: string;
  accessToken: string;
};

/** 로그인 성공 시 백엔드에서 내려주는 resultCode (한 곳 정의로 오타 방지) */
export const LOGIN_SUCCESS_CODE = "BPLTE200" as const;

// 로그인 요청
// [POST] /auth/login
export async function login(body: LoginRequest) {
  return api.post<LoginResponseData, LoginRequest>("/auth/login", body);
}
