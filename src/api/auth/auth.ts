import { api } from "../http/http";
import type { SignupFormValues } from "@/schemas/auth/signupSchema";

/** POST /auth/join body — 폼 스키마와 동일 */
export type SignupRequest = SignupFormValues;

// 회원가입 요청
// [POST] /auth/join
export async function signup(body: SignupRequest) {
  return api.post<number, SignupRequest>("/auth/join", body);
}

// 아이디 중복 확인
// [GET] /auth/available/user_id
export async function checkUserId(userId: string) {
  return api.get<boolean>("/auth/available/user_id", {
    params: { userId },
  });
}
