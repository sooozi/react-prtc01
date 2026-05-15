import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components";
import { useBodyScrollLock, useFloatingLayer } from "@/hooks/useFloatingLayer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getTabbableElements } from "@/utils/tabbable";
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

export type HeaderProps = {
  /** 레이아웃에서 스크롤로 헤더를 숨긴 경우: 포커스·포인터·보조공학 트리에서 제외 */
  scrollHidden?: boolean;
};

export default function Header({ scrollHidden = false }: HeaderProps) {
  const isMobileDrawerLayout = useMediaQuery("(max-width: 767px)");
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light"
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const focusBeforeDrawerRef = useRef<HTMLElement | null>(null);
  const headerRootRef = useRef<HTMLElement>(null);
  const scrollHiddenRef = useRef(scrollHidden);

  useLayoutEffect(() => {
    scrollHiddenRef.current = scrollHidden;
  }, [scrollHidden]);

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

  useFloatingLayer({
    open: menuOpen,
    enabled: isMobileDrawerLayout,
    layerRootRef: navRef,
    onEscape: closeMenu,
    lockScroll: false,
    trapTab: true,
    focusInitial: null,
    restoreFocusMode: null,
  });

  useEffect(() => {
    if (!menuOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 768) closeMenu();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen, closeMenu]);

  useBodyScrollLock(menuOpen);

  // 스크롤로 헤더가 숨겨진 동안 포커스가 헤더 안에 남지 않도록 본문으로 이동
  useLayoutEffect(() => {
    if (!scrollHidden) return;
    const root = headerRootRef.current;
    if (!root) return;
    const active = document.activeElement;
    if (!(active instanceof Node) || !root.contains(active)) return;
    const main = document.getElementById("main-content");
    if (main instanceof HTMLElement) {
      queueMicrotask(() => main.focus({ preventScroll: true }));
    }
  }, [scrollHidden]);

  // 모바일 드로어: 열릴 때 포커스를 패널 안으로, 닫힐 때 햄버거(또는 이전 요소)로 복귀
  useLayoutEffect(() => {
    if (!menuOpen || !isMobileDrawerLayout) return;

    const toggleButton = menuToggleRef.current;

    focusBeforeDrawerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const drawer = navLinksRef.current;
    if (drawer) {
      const list = getTabbableElements(drawer);
      queueMicrotask(() => {
        (list[0] ?? drawer).focus();
      });
    }

    return () => {
      if (scrollHiddenRef.current) {
        const main = document.getElementById("main-content");
        if (main instanceof HTMLElement) {
          queueMicrotask(() => main.focus({ preventScroll: true }));
        }
        return;
      }
      if (toggleButton && window.getComputedStyle(toggleButton).display !== "none") {
        toggleButton.focus({ preventScroll: true });
        return;
      }
      const back = focusBeforeDrawerRef.current;
      if (back?.isConnected && window.getComputedStyle(back).display !== "none") {
        back.focus({ preventScroll: true });
      }
    };
  }, [menuOpen, isMobileDrawerLayout]);

  // 드로어 안 클릭 시 닫기 — div에 onClick을 두면 jsx-a11y가 막아서 DOM 리스너로 처리
  useEffect(() => {
    if (!menuOpen) return;
    const el = navLinksRef.current;
    if (!el) return;
    const onClick = () => closeMenu();
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [menuOpen, closeMenu]);

  return (
    <header
      ref={headerRootRef}
      className={`header ${menuOpen ? "is-menu-open" : ""}${scrollHidden && !menuOpen ? " header--scroll-offscreen" : ""}`}
      inert={scrollHidden && !menuOpen ? true : undefined}
    >
      <div className="header__bg" aria-hidden />
      <nav ref={navRef} className="nav">
        <Link to="/home" className="logo" onClick={closeMenu}>
          <img
            src="/logo-mark.png"
            alt="MyViteProject"
            className="logo-img"
            decoding="async"
          />
        </Link>

        <button
          ref={menuToggleRef}
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          aria-controls="header-mobile-nav-drawer"
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

        <div
          id="header-mobile-nav-drawer"
          ref={navLinksRef}
          className="nav-links"
          tabIndex={-1}
        >
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
