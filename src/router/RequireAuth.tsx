import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasAuthToken } from "@/api/authToken";

/**
 * 로그인이 필요한 라우트 묶음의 부모 element.
 * 토큰 없으면 /auth/login 으로 보내고, 이후 복귀용으로 from 위치를 state에 넣음.
 */
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
