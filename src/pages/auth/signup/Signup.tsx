import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { signup, checkUserId } from "@/api/auth";
import "./Signup.scss";

interface SignupData {
  userId: string;
  userName: string;
  email: string;
  password: string;
}

export default function Signup() {
  const navigate = useNavigate();
  // 아이디 중복 확인 상태 (<"대기" | "확인중" | "사용가능" | "사용불가"> - 타입 제한)
  const [idCheckStatus, setIdCheckStatus] = useState<"대기" | "확인중" | "사용가능" | "사용불가">("대기");
  // 결과 메시지
  const [idCheckMessage, setIdCheckMessage] = useState("");

  // React Hook Form 설정 / mode: "onChange" - 입력할 때마다 유효성 검사 실행 (실시간 검사)
  const {
    register,      // input과 RHF 연결
    handleSubmit,  // 폼 제출 처리
    watch,         // 입력값 실시간 감시
    formState: { errors, isValid },  // errors: 에러 정보, isValid: 모든 필드 유효한지
  } = useForm<SignupData>({ mode: "onChange" });

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
    } catch (e) {
      console.error("아이디 중복 확인 실패:", e);
      setIdCheckStatus("사용불가");
      setIdCheckMessage("중복 확인에 실패했습니다.");
    }
  };  

  // 회원가입 제출
  const onSubmit = async (data: SignupData) => {
    alert("회원가입을 진행하시겠습니까?");
    try {
      const res = await signup(data);
      console.log("회원가입 응답:", res);
      alert("회원가입이 완료되었습니다!");
      navigate("/auth/login");
    } catch (e: unknown) {
      console.error("회원가입 실패:", e);
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="signup-container">
      {/* 배경 장식 */}
      <div className="bg-decoration-1" />
      <div className="bg-decoration-2" />

      <div className="signup-card">
        <div className="signup-header">
          <span className="badge">✨ Sign Up</span>
          <h1 className="title">회원가입</h1>
          <p className="subtitle">새로운 계정을 만들어보세요</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit(onSubmit)}>
          {/* 아이디 */}
          <div className="form-group">
            <div className="label-row">
              <label className="label" htmlFor="userId">아이디</label>
              <span className="hint-text">1~30자/영문, 숫자 조합</span>
            </div>
            <div className="input-with-button">
              <input
                type="text"
                id="userId"
                className={`input ${errors.userId ? "error" : ""}`} // 에러일 때 error 클래스 추가
                placeholder="아이디를 입력하세요"
                maxLength={30}
                aria-invalid={!!errors.userId} // 스크린 리더에게 유효하지 않음을 알림
                {...register("userId", { //input을 제어할 수 있게 연결해주는 함수!
                  required: "아이디를 입력해주세요.",  // 비어있으면 에러 + 메시지 표시
                  pattern: { // 정규식 검사
                    value: /^[a-zA-Z0-9]{1,30}$/,
                    message: "영문, 숫자 1~30자만 가능합니다.",
                  },
                  onChange: () => { // 입력값이 바뀔 때마다 실행할 커스텀 함수
                    setIdCheckStatus("대기");
                    setIdCheckMessage("");
                  },
                })}
              />
              <button
                type="button"
                className={`check-button ${idCheckStatus === "사용가능" ? "completed" : ""}`}
                onClick={handleCheckId}
                disabled={isIdCheckDisabled}
              >
                {idCheckStatus === "확인중" && "확인 중..."}
                {idCheckStatus === "사용가능" && "✓ 확인 완료"}
                {(idCheckStatus === "대기" || idCheckStatus === "사용불가") && "중복 확인"}
              </button>
            </div>
            <div className="message-area">
              {errors.userId && ( //유효성 검사 에러 메시지
                <span className="error-message">{errors.userId.message}</span>
              )}
              {idCheckMessage && ( // 중복확인 결과 메시지
                <span className={`check-message ${idCheckStatus}`}>
                  {idCheckMessage}
                </span>
              )}
            </div>
          </div>

          {/* 이름 */}
          <div className="form-group">
            <div className="label-row">
              <label className="label" htmlFor="userName">이름</label>
              <span className="hint-text">1~30자</span>
            </div>
            <input
              type="text"
              id="userName"
              className={`input ${errors.userName ? "error" : ""}`}
              placeholder="이름을 입력하세요"
              maxLength={30}
              aria-invalid={!!errors.userName}
              {...register("userName", {
                required: "이름을 입력해주세요.",
                pattern: {
                  value: /^[a-zA-Z0-9가-힣\s.-]{1,30}$/,
                  message: "영문, 숫자, 한글, 공백, 특수문자(.-) 1~30자만 가능합니다.",
                },
              })}
            />
            <div className="message-area">
              {errors.userName && (
                <span className="error-message">{errors.userName.message}</span>
              )}
            </div>
          </div>

          {/* 이메일 */}
          <div className="form-group">
            <div className="label-row">
              <label className="label" htmlFor="email">이메일</label>
              <span className="hint-text">최대 64자/이메일 형식</span>
            </div>
            <div className="input-with-button">
                <input
                  type="email"
                  id="email"
                  className={`input ${errors.email ? "error" : ""}`}
                  placeholder="test@gmail.com"
                  maxLength={64}
                  aria-invalid={!!errors.email}
                  {...register("email", {
                    required: "이메일을 입력해주세요.",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "올바른 이메일 형식이 아닙니다.",
                    },
                  })}
                  />
            </div>
            <div className="message-area">
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <div className="label-row">
              <label className="label" htmlFor="password">비밀번호</label>
              <span className="hint-text">1~30자/영문, 대문자, 숫자, 특수문자 조합</span>
            </div>
            <input
              type="password"
              id="password"
              className={`input ${errors.password ? "error" : ""}`}
              placeholder="비밀번호를 입력하세요"
              maxLength={30}
              aria-invalid={!!errors.password}
              {...register("password", {
                required: "비밀번호를 입력해주세요.",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@.]{5,30}$/,
                  message: "영문, 숫자 포함 5~30자 (특수문자 !@. 허용)",
                },
              })}
            />
            <div className="message-area">
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>
          </div>

          {/* 회원가입 버튼: isSubmitDisabled가 true면 클릭 불가 */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitDisabled}
          >
            회원가입
          </button>
        </form>

        <div className="signup-footer">
          <span>이미 계정이 있으신가요?</span>
          <a href="/auth/login" className="login-link">
            로그인
          </a>
        </div>
      </div>
    </div>
  );
}
