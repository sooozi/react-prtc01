import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import CatHover from "@/components/CatHover/CatHover";
import "./Layout.scss";

const HEADER_HEIGHT_PX = 72;
const SCROLL_THRESHOLD_PX = 80;
const BOTTOM_BUFFER_PX = 120; // 맨 아래 근처에서는 헤더 항상 표시 (버벅임 방지)

/**
 * 공통 레이아웃 컴포넌트
 * 헤더와 푸터를 자동으로 포함하고, Outlet에 페이지 내용을 렌더링합니다.
 * - header + main + footer = 100vh (콘텐츠가 짧을 때 푸터는 화면 하단 고정)
 * - 아래로 스크롤 시 헤더 숨김, 위로 스크롤 시 헤더 표시
 */
export default function Layout() {
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        const y = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const nearBottom = maxScroll > 0 && y >= maxScroll - BOTTOM_BUFFER_PX;

        let nextVisible: boolean;
        if (nearBottom) {
          nextVisible = true;
        } else if (y > lastScrollY.current && y > SCROLL_THRESHOLD_PX) {
          nextVisible = false;
        } else {
          nextVisible = true;
        }

        setHeaderVisible((prev) => (prev !== nextVisible ? nextVisible : prev));
        lastScrollY.current = y;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      className={`layout-container ${headerVisible ? "" : "layout-container--header-hidden"}`}
      style={{ "--header-height": `${HEADER_HEIGHT_PX}px` } as React.CSSProperties}
    >
      {/* 배경 장식 */}
      <div className="bg-decoration-1" />
      <div className="bg-decoration-2" />

      {/* 헤더 (스크롤 시 숨김/표시) */}
      <Header />

      {/* 고양이 - 화면 왼쪽 고정 */}
      <CatHover />

      {/* 메인 콘텐츠 - 각 페이지가 여기에 렌더링됨 */}
      <main className="layout-main">
        <Outlet />
      </main>

      {/* 푸터 - main 하단에 항상 위치 */}
      <Footer />
    </div>
  );
}
