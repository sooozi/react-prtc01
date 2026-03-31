import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasAuthToken } from "@/api/auth";

// 부모 라우트로 사용하는 컴포넌트
// 자식 경로 입장 전 토큰만 확인 후 없으면 로그인 화면 이동
export default function RequireAuth() {
  const location = useLocation();

  if (!hasAuthToken()) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location, toast: "로그인이 필요합니다" }}
      />
    );
  }

  return <Outlet />;
}
