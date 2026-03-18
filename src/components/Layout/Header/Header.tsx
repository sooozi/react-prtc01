import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components";
import "@/components/Layout/Header/Header.scss";

const THEME_KEY = "theme";

export default function Header() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light"
  );

  const toggleTheme = () => {
    // 현재 테마가 다크면 다음은 라이트, 라이트면 다음은 다크로 바꿀 값 정하기
    const next = theme === "dark" ? "light" : "dark";
    // <html>에 data-theme 속성을 넣어서 CSS에서 [data-theme="dark"] 등으로 색이 바뀌게 함
    document.documentElement.setAttribute("data-theme", next);
    // 다음에 페이지 열었을 때도 같은 테마가 적용되도록 localStorage에 저장
    localStorage.setItem(THEME_KEY, next);
    // React state를 갱신해서 버튼 아이콘(🌙/☀️)이 바로 바뀌게 함
    setTheme(next);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("lastLoginAt");
    navigate("/auth/login");
  };

  return (
    <header className="header">
      <nav className="nav">
        {/* 왼쪽: 로고 */}
        <Link to="/home" className="logo"> 
          <span className="logo-icon">🐱</span>
          <span className="logo-text">MyViteProject</span>
        </Link>

        {/* 오른쪽: 네비게이션 / 로그인 상태 */}
        <div className="nav-links">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/user/search" className="nav-link">Search</Link>
          <Link to="/post/list" className="nav-link">Board</Link>
          {userName ? (
            <>
              <Link to="/user/mypage" className="nav-link is-logged-in" title="마이페이지">
                <span className="nav-link__text">🧑🏻‍💻 {userName ?? "로그인됨"}</span>
                <span className="nav-link__tooltip" aria-hidden>마이페이지</span>
              </Link>
              <Button variant="ghost" className="nav-link logout-btn" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="nav-link">Login</Link>
              <Link to="/auth/signup" className="nav-link accent">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
