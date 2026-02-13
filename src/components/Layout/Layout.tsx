import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import "./Layout.scss";

/**
 * 공통 레이아웃 컴포넌트
 * 헤더와 푸터를 자동으로 포함하고, Outlet에 페이지 내용을 렌더링합니다.
 */
export default function Layout() {
  return (
    <div className="layout-container">
      {/* 배경 장식 */}
      <div className="bg-decoration-1" />
      <div className="bg-decoration-2" />

      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 - 각 페이지가 여기에 렌더링됨 */}
      <main className="layout-main">
        <Outlet />
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
