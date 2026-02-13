import { useNavigate } from "react-router-dom";
import "./Home.scss";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: '⚡',
      title: '빠른 성능',
      description: 'Vite 기반의 초고속 개발 환경으로 생산성을 극대화하세요.'
    },
    {
      icon: '🎨',
      title: '모던 디자인',
      description: 'React와 TypeScript로 구현된 세련된 UI 컴포넌트.'
    },
    {
      icon: '🔒',
      title: '안전한 구조',
      description: '타입 안정성과 보안을 고려한 설계로 안심하고 개발하세요.'
    }
  ];

  return (
    <>
      {/* 히어로 섹션 */}
      <section className="hero">
        <div className="hero-content">
          <span className="badge">🚀 새로운 버전 출시</span>
          <h1 className="hero-title">
            더 빠르고, 더 아름다운
            <br />
            <span className="gradient-text">개발 경험</span>
          </h1>
          <p className="hero-description">
            최신 기술 스택으로 구성된 Vite + React + TypeScript 프로젝트입니다.
            <br />
            직관적인 UI와 뛰어난 성능을 경험해보세요.
          </p>
          <button
            className="primary-button"
            onClick={() => navigate("/auth/signup")}
          >
            회원가입하기 →
          </button>
        </div>
      </section>

      {/* 피처 섹션 */}
      <section id="features" className="features-section">
        <h2 className="section-title">주요 기능</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <span className="feature-icon">{feature.icon}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
