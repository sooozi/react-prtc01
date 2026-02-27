import { Link } from "react-router-dom";
import "./MyPage.scss";

/** 최근 로그인 시각을 "n분 전" 또는 "YYYY.MM.DD HH:mm" 형태로 반환 */
function formatLastLogin(isoString: string | null): string {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${d} ${h}:${min}`;
}

export default function MyPage() {
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");
  const lastLoginAt = localStorage.getItem("lastLoginAt");
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="mypage-page">
        <section className="mypage-section">
          <span className="badge">🔐</span>
          <h1 className="title">마이페이지</h1>
          <p className="subtitle">로그인한 회원만 이용할 수 있습니다.</p>
          <Link to="/auth/login" className="login-link">
            로그인하기
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mypage-page">
      <section className="mypage-section">
        <span className="badge">👤 마이페이지</span>
        <h1 className="title">
          안녕하세요, <span className="highlight">{userName ?? "회원"}</span>님
        </h1>
        <p className="subtitle">회원 정보를 확인할 수 있습니다.</p>

        <div className="mypage-card">
          <h2 className="mypage-card__title">기본 정보</h2>
          <div className="mypage-card__row">
            <span className="mypage-card__label">아이디</span>
            <span className="mypage-card__value">{userId ?? "-"}</span>
          </div>
          <div className="mypage-card__row">
            <span className="mypage-card__label">이름</span>
            <span className="mypage-card__value">{userName ?? "-"}</span>
          </div>
        </div>

        <div className="mypage-card">
          <h2 className="mypage-card__title">로그인 정보</h2>
          <div className="mypage-card__row">
            <span className="mypage-card__label">최근 로그인</span>
            <span className="mypage-card__value">{formatLastLogin(lastLoginAt)}</span>
          </div>
        </div>

        <div className="mypage-actions">
          <Link to="/user/search" className="mypage-btn mypage-btn--secondary">
            사용자 검색
          </Link>
          <Link to="/home" className="mypage-btn mypage-btn--primary">
            홈으로
          </Link>
        </div>
      </section>
    </div>
  );
}
