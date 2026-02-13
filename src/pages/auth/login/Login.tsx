import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./Login.scss";

interface LoginFormData {
  userId: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // 로그인 제출
  const onSubmit = (data: LoginFormData) => {
    // TODO: API 호출
    console.log("로그인 데이터:", data);
    alert("로그인 성공!");
    navigate("/user/search");
  };

  return (
    <div className="login-container">
      {/* 배경 장식 */}
      <div className="bg-decoration-1" />
      <div className="bg-decoration-2" />

      <div className="login-card">
        <div className="login-header">
          <span className="badge">🔐 Login</span>
          <h1 className="title">로그인</h1>
        </div>

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
              {errors.userId && ( // 유효성 검사 에러 메시지
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
              {errors.password && ( // 유효성 검사 에러 메시지
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>
          </div>

          <button type="submit" className="submit-button">
            로그인
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
