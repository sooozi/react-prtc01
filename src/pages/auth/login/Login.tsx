import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { consumeLoginRedirectSession } from "@/api/auth/loginRedirectSession";
import { ApiError } from "@/api/http";
import { LOGIN_SUCCESS_CODE, login } from "@/api/auth";
import { Badge, Button } from "@/components";
import "@/pages/auth/login/Login.scss";

interface LoginFormData {
  userId: string;
  password: string;
}

/** RequireAuth 등에서 로그인으로 보낼 때 넘기는 state */
type LoginLocationState = { toast?: string; from?: Location };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [apiAlert, setApiAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  /** 보드 등에서 리다이렉트 시 전달한 "로그인이 필요합니다" 토스트 */
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  /** 비밀번호 보기/숨기기 */
  const [showPassword, setShowPassword] = useState(false);

  // RequireAuth의 state.toast 또는 API 401 인터셉터가 sessionStorage에 넣은 토스트 표시 후 state 정리
  useEffect(() => {
    const consumed = consumeLoginRedirectSession();
    const st = location.state as LoginLocationState | null;

    const toastMsg = st?.toast ?? consumed.toast ?? null;
    const fromLoc =
      st?.from ??
      (consumed.from
        ? ({
            pathname: consumed.from.pathname,
            search: consumed.from.search,
            hash: consumed.from.hash,
            state: null,
            key: "default",
          } as Location)
        : undefined);

    if (toastMsg) {
      setToastMessage(toastMsg);
    }

    const shouldNormalizeState = Boolean(
      st?.toast ?? consumed.toast ?? consumed.from
    );
    if (shouldNormalizeState) {
      const next: LoginLocationState = {};
      if (fromLoc) next.from = fromLoc;
      navigate(location.pathname, {
        replace: true,
        state: Object.keys(next).length ? next : undefined,
      });
    }
  }, [location.pathname, location.state, navigate]);

  // 토스트 메시지 3초 후 사라지도록
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);
  // React Hook Form 설정
  const {
    register, // input과 RHF 연결
    handleSubmit, // 폼 제출 처리
    watch, // 폼 필드 값 구독(변경 시 리렌더)
    formState: { errors }, // errors: 에러 정보
  } = useForm<LoginFormData>();

  // 아이디/비밀번호 현재 값
  const userId = watch("userId");
  const password = watch("password");
  // 둘 다 한 글자 이상 입력 시 로그인 버튼 활성화 (공백만 있으면 비활성)
  const isFormFilled = Boolean(userId?.trim() && password?.trim());

  const onSubmit = async (data: LoginFormData) => {
    setApiAlert(null);
    setIsLoading(true);
    try {
      // 로그인 요청
      const res = await login(data);
      // 로그인 성공 여부 확인
      if (res.resultCode === LOGIN_SUCCESS_CODE) {
        setApiAlert({
          type: "success",
          message: res.resultMessage ?? res.resultDetailMessage ?? "로그인되었습니다.",
        });
        localStorage.setItem("token", res.data.accessToken);
        localStorage.setItem("userName", res.data.userName);
        localStorage.setItem("userId", res.data.userId);
        // localStorage.setItem("lastLoginAt", new Date().toISOString());
        const st = location.state as LoginLocationState | null;
        const from = st?.from;
        const dest =
          from?.pathname != null && from.pathname !== ""
            ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
            : "/user/list";
        navigate(dest, { replace: true });
      } else {
        setApiAlert({
          type: "error",
          message: res.resultMessage ?? res.resultDetailMessage ?? "로그인에 실패했습니다.",
        });
      }
    } catch (e: unknown) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "네트워크 오류가 발생했습니다.";
      setApiAlert({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="bg-decoration-1" />
      <div className="bg-decoration-2" />

      {toastMessage && (
        <div className="login-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}

      <div className="login-card">
        <div className="login-header">
          <Badge>🔐 Login</Badge>
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
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`input ${errors.password ? "error" : ""}`}
                placeholder="비밀번호를 입력하세요"
                {...register("password", {
                  required: "비밀번호를 입력해주세요.",
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                title={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="message-area">
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="submit-button"
            disabled={isLoading || !isFormFilled}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
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
