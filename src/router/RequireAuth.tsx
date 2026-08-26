import { Navigate, Outlet, useLocation } from "react-router-dom";
import { clearExpiredAuthToken, hasAuthToken, isStoredAuthTokenExpired } from "@/api/auth";

// 부모 라우트로 사용하는 컴포넌트
// 자식 경로 입장 전 토큰 존재·만료 여부 확인 후 문제가 있으면 로그인 화면 이동
// (최종 인증 검증은 항상 서버가 하므로, 여기서는 서버 왕복 없이 걸러내는 UX용 사전 검사일 뿐)
export default function RequireAuth() {
  const location = useLocation();

  if (!hasAuthToken()) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location, toast: "로그인이 필요합니다" }} />
    );
  }

  if (isStoredAuthTokenExpired()) {
    clearExpiredAuthToken();
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location, toast: "로그인이 만료되었습니다. 다시 로그인해주세요." }}
      />
    );
  }

  return <Outlet />;
}
