import axios from "axios";

//프론트 → 서버
export type SignupRequest = {
  userId: string;
  userName: string;
  email: string;
  password: string;
};

//서버 → 프론트 응답 타입: 서버가 응답으로 내려주는 JSON 구조를 타입으로 정의
export type ApiResponse<T = unknown> = {
  resultCode: string;
  resultMessage: string;
  resultDetailMessage?: string;
  data: T;// ← 빈칸 (나중에 채워짐)
};

export async function signup(body: SignupRequest) {
  const res = await axios.post<ApiResponse<number>>(
    "http://localhost:8081/bplte/core/auth/join",
    body,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}

// 아이디 중복 확인
export async function checkUserId(userId: string) {
  const res = await axios.get<ApiResponse<boolean>>(
    "http://localhost:8081/bplte/core/auth/available/user_id",
    {
      params: { userId },
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}