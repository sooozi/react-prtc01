import { Link } from "react-router-dom";
import "./Header.scss";

/**
 * 공통 헤더 컴포넌트
 */
export default function Header() {
  return (
    <header className="header">
      <nav className="nav">
        {/* 왼쪽: 로고 */}
        <Link to="/home" className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">MyViteProject</span>
        </Link>

        {/* 오른쪽: 네비게이션 링크 */}
        <div className="nav-links">
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/user/search" className="nav-link">Search</Link>
          <Link to="/auth/login" className="nav-link">Login</Link>
          <Link to="/auth/signup" className="nav-link accent">Sign Up</Link>
        </div>
      </nav>
    </header>
  );
}
