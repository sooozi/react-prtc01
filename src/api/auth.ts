import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";

//프론트 → 서버
export type SignupRequest = {
  userId: string;
  userName: string;
  email: string;
  password: string;
};

// 회원가입 요청
// [POST] /auth/join
export async function signup(body: SignupRequest) {
  const res = await apiClient.post<ApiResponse<number>>("/auth/join", body);
  return res.data;
}

// 아이디 중복 확인
// [GET] /auth/available/user_id
export async function checkUserId(userId: string) {
  const res = await apiClient.get<ApiResponse<boolean>>(
    "/auth/available/user_id",
    { params: { userId } }
  );
  return res.data;
}
