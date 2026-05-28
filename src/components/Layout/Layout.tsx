import { Outlet, useLocation } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import Header from "@/components/Layout/Header/Header";
import Footer from "@/components/Layout/Footer/Footer";
import ApiErrorBar from "@/components/ApiErrorBar/ApiErrorBar";
import "@/components/Layout/Layout.scss";

/** main 안 페이지 영역 — 경로 변경 시 Error Boundary 상태 초기화 */
function MainOutlet() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Outlet />
    </ErrorBoundary>
  );
}

/**
 * 공통 레이아웃 컴포넌트
 * 헤더와 푸터를 자동으로 포함하고, Outlet에 페이지 내용을 렌더링합니다.
 * header + main + footer = 100vh (콘텐츠가 짧을 때 푸터는 화면 하단 고정)
 */
export default function Layout() {
  const { pathname } = useLocation();
  const mainClassName =
    pathname === "/style-guide" ? "layout-main layout-main--style-guide" : "layout-main";

  return (
    <div className="layout-container">
      <a href="#main-content" className="skip-to-main">
        본문으로 건너뛰기
      </a>
      <div className="bg-decoration-1" />
      <div className="bg-decoration-2" />

      <Header />

      <ApiErrorBar />

      <main id="main-content" className={mainClassName} tabIndex={-1}>
        <MainOutlet />
      </main>

      <Footer />
    </div>
  );
}
