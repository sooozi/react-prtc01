import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";

export default function Header() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/auth/login");
  };

  return (
    <header className="header">
      <nav className="nav">
        {/* 왼쪽: 로고 */}
        <Link to="/home" className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">MyViteProject</span>
        </Link>

        {/* 오른쪽: 네비게이션 / 로그인 상태 */}
        <div className="nav-links">
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/user/search" className="nav-link">Search</Link>
          {userName ? (
            <>
              <span className="nav-link is-logged-in">{ "🧑🏻‍💻 " + (userName ?? "로그인됨") }</span>
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
