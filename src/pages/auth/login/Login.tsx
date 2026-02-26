import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { isLoginSuccess, login } from "../../../api/login";
import { useAuth } from "@/contexts/AuthContext";
import "./Login.scss";

interface LoginFormData {
  userId: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate(); 
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  // API 응답 알림
  const [apiAlert, setApiAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  // React Hook Form 설정
  const {
    register, // input과 RHF 연결
    handleSubmit, // 폼 제출 처리
    watch, // 폼 필드 값 구독(변경 시 리렌더)
    formState: { errors }, // errors: 에러 정보
  } = useForm<LoginFormData>();

  // 아이디/비밀번호 현재 값 (watch → 입력할 때마다 갱신)
  const userId = watch("userId");
  const password = watch("password");
  // 둘 다 한 글자 이상 입력 시 로그인 버튼 활성화 (공백만 있으면 비활성)
  const isFormFilled = Boolean(userId?.trim() && password?.trim());

  // 인증 컨텍스트 사용
  const { setToken, setUserName } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    setApiAlert(null);
    setIsLoading(true);
    try {
      // 로그인 요청
      const res = await login(data);
      // 로그인 성공 여부 확인
      if (isLoginSuccess(res)) {
        setApiAlert({
          type: "success",
          message: res.resultMessage ?? res.resultDetailMessage ?? "로그인되었습니다.",
        });  
        // 토큰·이름 저장 (전역 + 로컬 스토리지)
        setToken(res.data.accessToken);
        setUserName(res.data.userName);
        localStorage.setItem("token", res.data.accessToken);
        localStorage.setItem("userName", res.data.userName);
        // 홈 페이지로 이동
        navigate("/user/search");
      } else {
        setApiAlert({
          type: "error",
          message: res.resultMessage ?? res.resultDetailMessage ?? "로그인에 실패했습니다.",
        });
      }
    } catch (e: unknown) {//api 호출 실패 시 에러 처리
      const message =
      //e가 있고, 객체이고, response 속성이 있는지 확인
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { resultMessage?: string }; status?: number } }).response?.data?.resultMessage
          : null;
      setApiAlert({ type: "error", message: message ?? "네트워크 오류가 발생했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 배경 장식 */}
      <div className="bg-decoration-1" />
      <div className="bg-decoration-2" />

      <div className="login-card">
        <div className="login-header">
          <span className="badge">🔐</span>
          <h1 className="title">로그인</h1>
        </div>

        {apiAlert && (
          <div
            className={apiAlert.type === "success" ? "login-success-alert" : "login-error-alert"}
            role="alert"
          >
            <span className={apiAlert.type === "success" ? "login-success-alert__icon" : "login-error-alert__icon"} aria-hidden>
              {apiAlert.type === "success" ? "✓" : "!"}
            </span>
            <span className={apiAlert.type === "success" ? "login-success-alert__text" : "login-error-alert__text"}>
              {apiAlert.message}
            </span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          {/* 아이디 */}
          <div className="form-group">
            <label className="label" htmlFor="userId">
              아이디
            </label>
            <input
              type="text"
              id="userId"
              className={`input ${errors.userId ? "error" : ""}`}
              placeholder="아이디를 입력하세요"
              {...register("userId", {
                required: "아이디를 입력해주세요.",
              })}
            />
            <div className="message-area">
              {errors.userId && (
                <span className="error-message">{errors.userId.message}</span>
              )}
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label className="label" htmlFor="password">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              className={`input ${errors.password ? "error" : ""}`}
              placeholder="비밀번호를 입력하세요"
              {...register("password", {
                required: "비밀번호를 입력해주세요.",
              })}
            />
            <div className="message-area">
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || !isFormFilled}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="login-footer">
          <span>계정이 없으신가요?</span>
          <a href="/auth/signup" className="signup-link">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}
