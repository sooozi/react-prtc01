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

  const techStack = [
    { name: 'Vite', desc: '빌드 도구' },
    { name: 'React 18', desc: 'UI 라이브러리' },
    { name: 'TypeScript', desc: '타입 안정성' },
    { name: 'React Router', desc: '라우팅' },
    { name: 'SCSS', desc: '스타일링' }
  ];

  const quickLinks = [
    { to: '/auth/signup', label: '회원가입', icon: '📝' },
    { to: '/auth/login', label: '로그인', icon: '🔑' },
    { to: '/user/search', label: '사용자 검색', icon: '🔍' },
    { to: '/user/mypage', label: '마이페이지', icon: '👤' }
  ];

  const sitemapItems = [
    { to: '/about', title: '소개', subtitle: '프로젝트와 기술 스택을 소개합니다.', theme: 'default' },
    { to: '/auth/login', title: '로그인', subtitle: '계정으로 로그인하세요.', theme: 'primary' },
    { to: '/auth/signup', title: '회원가입', subtitle: '새 계정을 만드세요.', theme: 'secondary' },
    { to: '/user/search', title: '사용자 검색', subtitle: '멤버를 검색해보세요.', theme: 'accent' },
    { to: '/user/mypage', title: '마이페이지', subtitle: '나의 정보를 확인하세요.', theme: 'default' }
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

      {/* 기술 스택 */}
      <section className="tech-section">
        <h2 className="section-title">기술 스택</h2>
        <div className="tech-grid">
          {techStack.map((tech, index) => (
            <div key={index} className="tech-chip">
              <span className="tech-name">{tech.name}</span>
              <span className="tech-desc">{tech.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 사이트맵 */}
      <section className="sitemap-section">
        <h2 className="sitemap-headline">사이트맵</h2>
        <p className="sitemap-subline">원하는 페이지로 이동하세요.</p>
        <div className="sitemap-grid">
          {sitemapItems.map((item, index) => (
            <button
              key={index}
              type="button"
              className={`sitemap-card sitemap-card--${item.theme}`}
              onClick={() => navigate(item.to)}
            >
              <div className="sitemap-card-inner">
                <h3 className="sitemap-card-title">{item.title}</h3>
                <p className="sitemap-card-subtitle">{item.subtitle}</p>
                <span className="sitemap-card-link">
                  더 알아보기
                  <span className="sitemap-card-arrow" aria-hidden>›</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 빠른 링크 */}
      <section className="links-section">
        <h2 className="section-title">바로가기</h2>
        <div className="links-grid">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              type="button"
              className="link-card"
              onClick={() => navigate(link.to)}
            >
              <span className="link-icon">{link.icon}</span>
              <span className="link-label">{link.label}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
