import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components";
import "@/components/Layout/Header/Header.scss";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.55,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function DrawerNavIcon({ children }: { children: ReactNode }) {
  return (
    <span className="nav-link__icon" aria-hidden>
      <svg {...iconProps} className="nav-link__icon-svg">
        {children}
      </svg>
    </span>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 닫기
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // 다크 모드 토글
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("lastLoginAt");
    navigate("/auth/login");
    closeMenu();
  };

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const onResize = () => {
      if (window.innerWidth >= 768) closeMenu();
    };
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className={`header ${menuOpen ? "is-menu-open" : ""}`}>
      <div className="header__bg" aria-hidden />
      <nav className="nav">
        <Link to="/home" className="logo" onClick={closeMenu}>
          <span className="logo-icon">🐱</span>
          <span className="logo-text">MyViteProject</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>

        <button
          type="button"
          className="nav-overlay"
          aria-label="메뉴 닫기"
          onClick={(e) => {
            e.preventDefault();
            closeMenu();
          }}
          tabIndex={menuOpen ? 0 : -1}
        />

        <div className="nav-links" onClick={closeMenu}>
          <div
            className={`nav-links__top${userName ? "" : " nav-links__top--guest"}`}
            role="group"
            aria-label={userName ? "Account and theme" : "Display theme"}
          >
            <div className="nav-links__top-bar">
              <button
                type="button"
                className="theme-toggle"
                onClick={(e) => {
                  // 다크 모드 토글 버튼 클릭 시 메뉴 닫기
                  e.stopPropagation();
                  // 다크 모드 토글
                  toggleTheme();
                }}
                title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
                aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              {userName ? (
                <Link
                  to="/user/mypage"
                  className="nav-links__profile nav-link is-logged-in"
                  title="마이페이지"
                >
                  <span className="nav-links__avatar" aria-hidden>
                    🧑🏻‍💻
                  </span>
                  <span className="nav-links__profile-body">
                    <span className="nav-links__profile-name">{userName}</span>
                    <span className="nav-links__profile-hint">My page</span>
                  </span>
                  <span className="nav-links__profile-desktop nav-link__text">
                    🧑🏻‍💻 {userName}
                  </span>
                  <span className="nav-link__tooltip" aria-hidden>
                    My Page
                  </span>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="nav-links__list" role="presentation">
            <p className="nav-links__section-label">Menu</p>
            <Link to="/about" className="nav-link nav-link--drawer">
              <DrawerNavIcon>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </DrawerNavIcon>
              <span className="nav-link__label">About</span>
            </Link>
            <Link to="/user/list" className="nav-link nav-link--drawer">
              <DrawerNavIcon>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </DrawerNavIcon>
              <span className="nav-link__label">User</span>
            </Link>
            <Link to="/post/list" className="nav-link nav-link--drawer">
              <DrawerNavIcon>
                <path d="M8 6h13M8 12h13M8 18h13" />
                <path d="M3 6h.01M3 12h.01M3 18h.01" />
              </DrawerNavIcon>
              <span className="nav-link__label">Board</span>
            </Link>
            <Link to="/schedule" className="nav-link nav-link--drawer">
              <DrawerNavIcon>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </DrawerNavIcon>
              <span className="nav-link__label">Schedule</span>
            </Link>

            {userName ? (
              <Button variant="ghost" className="nav-link nav-link--drawer logout-btn" onClick={handleLogout}>
                <DrawerNavIcon>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </DrawerNavIcon>
                <span className="nav-link__label">Logout</span>
              </Button>
            ) : (
              <>
                <Link to="/auth/login" className="nav-link nav-link--drawer">
                  <DrawerNavIcon>
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" x2="3" y1="12" y2="12" />
                  </DrawerNavIcon>
                  <span className="nav-link__label">Login</span>
                </Link>
                <Link to="/auth/signup" className="nav-link nav-link--drawer-cta accent">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
