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

/** 로그인 성공 시 data 안에 오는 값 */
export type LoginResponseData = {
  userId: string;
  userName: string;
  accessToken: string;
};

/** 응답이 로그인 성공인지 (백엔드 성공 코드: BPLTE200) */
export function isLoginSuccess(res: ApiResponse<unknown>): boolean {
  return res.resultCode === "BPLTE200";
}

// 로그인 요청
export async function login(body: LoginRequest) {
  const res = await axios.post<ApiResponse<LoginResponseData>>(
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