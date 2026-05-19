import { z } from "zod";

/** 로그인 폼 · POST /auth/login body */
export const loginSchema = z.object({
  userId: z.string().trim().min(1, "아이디를 입력해주세요."),
  password: z.string().trim().min(1, "비밀번호를 입력해주세요."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
