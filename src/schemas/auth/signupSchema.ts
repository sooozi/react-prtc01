import { z } from "zod";

const USER_ID_REGEX = /^[a-zA-Z0-9]{1,30}$/;
const USER_NAME_REGEX = /^[a-zA-Z0-9가-힣\s.-]{1,30}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@.]{5,30}$/;

/** 회원가입 폼 · POST /auth/join body */
export const signupSchema = z.object({
  userId: z
    .string()
    .min(1, "아이디를 입력해주세요.")
    .regex(USER_ID_REGEX, "영문, 숫자 1~30자만 가능합니다."),
  userName: z
    .string()
    .min(1, "이름을 입력해주세요.")
    .regex(USER_NAME_REGEX, "영문, 숫자, 한글, 공백, 특수문자(.-) 1~30자만 가능합니다."),
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .max(64, "이메일은 64자 이하여야 합니다.")
    .regex(EMAIL_REGEX, "올바른 이메일 형식이 아닙니다."),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요.")
    .regex(PASSWORD_REGEX, "영문, 숫자 포함 5~30자 (특수문자 !@. 허용)"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
