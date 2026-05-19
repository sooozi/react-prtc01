import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { signup, checkUserId } from "@/api/auth";
import { ApiError } from "@/api/http";
import { Button, Confirm, PageHeader } from "@/components";
import { formDescribedBy } from "@/lib/a11y/formDescribedBy";
import { signupSchema, type SignupFormValues } from "@/schemas/auth";
import "@/pages/auth/signup/Signup.scss";

export default function Signup() {
  const navigate = useNavigate();
  // 아이디 중복 확인 상태 (<"대기" | "확인중" | "사용가능" | "사용불가"> - 타입 제한)
  const [idCheckStatus, setIdCheckStatus] = useState<"대기" | "확인중" | "사용가능" | "사용불가">("대기");
  // 결과 메시지
  const [idCheckMessage, setIdCheckMessage] = useState("");
  /** 비밀번호 보기/숨기기 */
  const [showPassword, setShowPassword] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSuccessConfirm, setShowSuccessConfirm] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pendingSignupData, setPendingSignupData] = useState<SignupFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form 설정 / mode: "onChange" - 입력할 때마다 유효성 검사 실행 (실시간 검사)
  const {
    register,      // input과 RHF 연결
    handleSubmit,  // 폼 제출 처리
    watch,         // 입력값 실시간 감시
    formState: { errors, isValid },  // errors: 에러 정보, isValid: 모든 필드 유효한지
  } = useForm<SignupFormValues>({
    mode: "onChange",
    resolver: zodResolver(signupSchema),
  });

  // 아이디 입력값 (입력값을 실시간으로 가져옴)
  const userId = watch("userId");

  // 아이디 중복 확인 버튼 비활성화 조건
  const isIdCheckDisabled = 
    !userId ||
    !!errors.userId ||
    idCheckStatus === "확인중" ||
    idCheckStatus === "사용가능";

  // 회원가입 버튼 비활성화 조건 (모든 필드 미입력 또는 정규식 불만족, 중복확인 안 함)
  const isSubmitDisabled = !isValid || idCheckStatus !== "사용가능";

  // 아이디 중복 확인
  const handleCheckId = async () => {
    if (!userId || userId.trim() === "") {
      setIdCheckMessage("아이디를 입력해주세요.");
      setIdCheckStatus("사용불가");
      return;
    }

    setIdCheckStatus("확인중");
    try {
      const res = await checkUserId(userId);
      if (res.data) { //true
        setIdCheckStatus("사용가능");
        setIdCheckMessage("사용 가능한 아이디입니다.");
      } else { //false
        setIdCheckStatus("사용불가");
        setIdCheckMessage("이미 사용 중인 아이디입니다.");
      }
    } catch (e: unknown) {
      if (import.meta.env.DEV) {
        console.error("아이디 중복 확인 실패:", e);
      }
      setIdCheckStatus("사용불가");
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "중복 확인에 실패했습니다.";
      setIdCheckMessage(message);
    }
  };  

  const onSubmit = (data: SignupFormValues) => {
    setSubmitError("");
    setPendingSignupData(data);
    setShowSubmitConfirm(true);
  };

  const handleSubmitConfirm = async () => {
    setShowSubmitConfirm(false);
    if (!pendingSignupData) return;

    setSubmitError("");
    setIsSubmitting(true);
    try {
      await signup(pendingSignupData);
      setShowSuccessConfirm(true);
    } catch (e: unknown) {
      if (import.meta.env.DEV) {
        console.error("회원가입 실패:", e);
      }
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "회원가입에 실패했습니다. 다시 시도해주세요.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
      setPendingSignupData(null);
    }
  };

  const handleSubmitConfirmCancel = () => {
    setShowSubmitConfirm(false);
    setPendingSignupData(null);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessConfirm(false);
    navigate("/auth/login");
  };

  return (
    <div className="signup-container">
      {/* 배경 장식 */}
      <div className="bg-decoration-1" />
      <div className="bg-decoration-2" />

      <div className="signup-card">
        <PageHeader
          badge="Sign Up"
          title="회원가입"
          subtitle="새로운 계정을 만들어보세요"
          variant="auth"
        />

        {submitError && (
          <div className="message error" id="signup-submit-error" role="alert">
            {submitError}
          </div>
        )}

        <form
          className="signup-form"
          onSubmit={handleSubmit(onSubmit)}
          aria-describedby={submitError ? "signup-submit-error" : undefined}
        >
          {/* 아이디 */}
          <div className="form-group">
            <div className="label-row">
              <label className="label" htmlFor="userId">아이디</label>
              <span id="signup-userId-hint" className="hint-text">
                1~30자/영문, 숫자 조합
              </span>
            </div>
            <div className="input-with-button">
              <input
                type="text"
                id="userId"
                className={`input ${errors.userId ? "error" : ""}`} // 에러일 때 error 클래스 추가
                placeholder="아이디를 입력하세요"
                maxLength={30}
                aria-invalid={!!errors.userId}
                aria-describedby={formDescribedBy(
                  "signup-userId-hint",
                  errors.userId && "signup-userId-error",
                  idCheckMessage && "signup-userId-check"
                )}
                {...register("userId", {
                  onChange: () => {
                    setIdCheckStatus("대기");
                    setIdCheckMessage("");
                  },
                })}
              />
              <Button
                type="button"
                variant="outlinePrimary"
                size="sm"
                className={idCheckStatus === "사용가능" ? "completed" : ""}
                onClick={handleCheckId}
                disabled={isIdCheckDisabled}
              >
                {idCheckStatus === "확인중" && "확인 중..."}
                {idCheckStatus === "사용가능" && "✓ 확인 완료"}
                {(idCheckStatus === "대기" || idCheckStatus === "사용불가") && "중복 확인"}
              </Button>
            </div>
            {(errors.userId || idCheckMessage) && (
              <div className="message-area">
                {errors.userId && (
                  <p id="signup-userId-error" className="error-message" role="alert">
                    {errors.userId.message}
                  </p>
                )}
                {idCheckMessage && (
                  <p
                    id="signup-userId-check"
                    className={`check-message ${idCheckStatus}`}
                    role={idCheckStatus === "사용불가" ? "alert" : "status"}
                  >
                    {idCheckMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 이름 */}
          <div className="form-group">
            <div className="label-row">
              <label className="label" htmlFor="userName">이름</label>
              <span id="signup-userName-hint" className="hint-text">
                1~30자
              </span>
            </div>
            <input
              type="text"
              id="userName"
              className={`input ${errors.userName ? "error" : ""}`}
              placeholder="이름을 입력하세요"
              maxLength={30}
              aria-invalid={!!errors.userName}
              aria-describedby={formDescribedBy(
                "signup-userName-hint",
                errors.userName && "signup-userName-error"
              )}
              {...register("userName")}
            />
            {errors.userName && (
              <p id="signup-userName-error" className="message-area error-message" role="alert">
                {errors.userName.message}
              </p>
            )}
          </div>

          {/* 이메일 */}
          <div className="form-group">
            <div className="label-row">
              <label className="label" htmlFor="email">이메일</label>
              <span id="signup-email-hint" className="hint-text">
                최대 64자/이메일 형식
              </span>
            </div>
            <div className="input-with-button">
                <input
                  type="email"
                  id="email"
                  className={`input ${errors.email ? "error" : ""}`}
                  placeholder="test@gmail.com"
                  maxLength={64}
                  aria-invalid={!!errors.email}
                  aria-describedby={formDescribedBy(
                    "signup-email-hint",
                    errors.email && "signup-email-error"
                  )}
                  {...register("email")}
                  />
            </div>
            {errors.email && (
              <p id="signup-email-error" className="message-area error-message" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <div className="label-row">
              <label className="label" htmlFor="password">비밀번호</label>
              <span id="signup-password-hint" className="hint-text">
                1~30자/영문, 대문자, 숫자, 특수문자 조합
              </span>
            </div>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`input ${errors.password ? "error" : ""}`}
                placeholder="비밀번호를 입력하세요"
                maxLength={30}
                aria-invalid={!!errors.password}
                aria-describedby={formDescribedBy(
                  "signup-password-hint",
                  errors.password && "signup-password-error"
                )}
                {...register("password")}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                title={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                <span aria-hidden>{showPassword ? "🙈" : "👁️"}</span>
              </button>
            </div>
            {errors.password && (
              <p id="signup-password-error" className="message-area error-message" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 회원가입 버튼: isSubmitDisabled가 true면 클릭 불가 */}
          <Button
            type="submit"
            variant="primary"
            className="submit-button"
            disabled={isSubmitDisabled || isSubmitting}
          >
            {isSubmitting ? "가입 처리 중..." : "회원가입"}
          </Button>
        </form>

        <div className="signup-footer">
          <span>이미 계정이 있으신가요?</span>
          <a href="/auth/login" className="login-link">
            로그인
          </a>
        </div>
      </div>

      <Confirm
        open={showSubmitConfirm}
        title="회원가입"
        message="회원가입을 진행하시겠습니까?"
        confirmLabel="가입하기"
        cancelLabel="취소"
        onConfirm={handleSubmitConfirm}
        onCancel={handleSubmitConfirmCancel}
      />
      <Confirm
        open={showSuccessConfirm}
        title="회원가입 완료"
        message="회원가입이 완료되었습니다!"
        confirmLabel="로그인하기"
        cancelLabel="닫기"
        onConfirm={handleSuccessConfirm}
        onCancel={() => setShowSuccessConfirm(false)}
      />
    </div>
  );
}
