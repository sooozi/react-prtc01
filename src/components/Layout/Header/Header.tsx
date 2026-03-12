import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";

export default function Header() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

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
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/user/search" className="nav-link">Search</Link>
          <Link to="/post/list" className="nav-link">Board</Link>
          {userName ? (
            <>
              <Link to="/user/mypage" className="nav-link is-logged-in" title="마이페이지">
                <span className="nav-link__text">🧑🏻‍💻 {userName ?? "로그인됨"}</span>
                <span className="nav-link__tooltip" aria-hidden>마이페이지</span>
              </Link>
              <button type="button" className="nav-link logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
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
