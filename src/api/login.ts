import axios from "axios";

//프론트 → 서버
export type LoginRequest = {
    userId: string;
    password: string;
};

// 서버 → 프론트 응답 타입
export type ApiResponse<T = unknown> = {
  resultCode: string;
  resultMessage: string;
  resultDetailMessage?: string;
  data: T;
};

/** API 응답만 보고 성공 여부 판단 (성공 코드는 여기서만 관리) */
const LOGIN_SUCCESS_CODES = ["SUCCESS", "BPLTE200", "0000", "200", "0"];

export function isLoginSuccess(res: ApiResponse<unknown>): boolean {
  if (LOGIN_SUCCESS_CODES.includes(res.resultCode)) return true;
  return false;
}

export async function login(body: LoginRequest) {
  const res = await axios.post<ApiResponse<number>>(
    "http://localhost:8081/bplte/core/auth/login",
    body,
    {
        headers: {
            "Content-Type": "application/json",
        },
    }
  );

  return res.data;
}

