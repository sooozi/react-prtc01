import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/pages/user/MyPage.scss";

export default function MyPage() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      navigate("/auth/login", { state: { toast: "로그인이 필요합니다" }, replace: true });
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  return (
    <div className="mypage-page">
      <section className="mypage-section">
        <span className="badge">👤 MyPage</span>
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
          <h2 className="mypage-card__title">계정 정보</h2>
          <div className="mypage-card__row">
            <span className="mypage-card__label">회원 유형</span>
            <span className="mypage-card__value">일반 회원</span>
          </div>
          <div className="mypage-card__row">
            <span className="mypage-card__label">계정 상태</span>
            <span className="mypage-card__value">정상</span>
          </div>
        </div>

        <div className="mypage-actions">
          <Link to="/user/search" className="mypage-btn mypage-btn--secondary">
            사용자 목록
          </Link>
          <Link to="/home" className="mypage-btn mypage-btn--primary">
            홈으로
          </Link>
        </div>
      </section>
    </div>
  );
}
