import { api } from "@/api/http";

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
  return api.post<number, SignupRequest>("/auth/join", body);
}

// 아이디 중복 확인
// [GET] /auth/available/user_id
export async function checkUserId(userId: string) {
  return api.get<boolean>("/auth/available/user_id", {
    params: { userId },
  });
}
