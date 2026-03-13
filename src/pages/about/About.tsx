import { useNavigate } from "react-router-dom";
import "@/pages/about/About.scss";

export default function About() {
  const navigate = useNavigate();

  const team = [
    {
      name: "김개발",
      role: "Frontend Developer",
      avatar: "👨‍💻",
      description: "React와 TypeScript 전문가",
    },
    {
      name: "이디자인",
      role: "UI/UX Designer",
      avatar: "🎨",
      description: "사용자 경험 설계 전문가",
    },
    {
      name: "박백엔드",
      role: "Backend Developer",
      avatar: "⚙️",
      description: "서버 및 API 개발 전문가",
    },
  ];

  const techStack = [
    { name: "React", icon: "⚛️" },
    { name: "TypeScript", icon: "📘" },
    { name: "Vite", icon: "⚡" },
    { name: "React Router", icon: "🔀" },
  ];

  return (
    <div className="about-page">
      {/* 히어로 섹션 */}
      <section className="hero-section">
        <span className="badge">ℹ️ About Us</span>
        <h1 className="title">
          우리는 <span className="gradient-text">혁신</span>을 만듭니다
        </h1>
        <p className="subtitle">
          최신 기술과 창의적인 아이디어로 더 나은 디지털 경험을 제공합니다.
          <br />
          MyViteProject는 빠르고 안정적인 웹 애플리케이션 개발을 목표로 합니다.
        </p>
      </section>

      {/* 미션 & 비전 */}
      <section className="mission-section">
        <div className="mission-grid">
          <div className="mission-card">
            <span className="mission-icon">🎯</span>
            <h3 className="mission-title">미션</h3>
            <p className="mission-text">
              사용자 중심의 직관적인 인터페이스와 뛰어난 성능으로
              개발 생산성을 극대화합니다.
            </p>
          </div>
          <div className="mission-card">
            <span className="mission-icon">🚀</span>
            <h3 className="mission-title">비전</h3>
            <p className="mission-text">
              모든 개발자가 쉽고 빠르게 아이디어를 현실로 만들 수 있는
              플랫폼을 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 기술 스택 */}
      <section className="tech-section">
        <h2 className="section-title">기술 스택</h2>
        <div className="tech-grid">
          {techStack.map((tech, index) => (
            <div key={index} className="tech-card">
              <span className="tech-icon">{tech.icon}</span>
              <span className="tech-name">{tech.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 팀 소개 */}
      <section className="team-section">
        <h2 className="section-title">팀 소개</h2>
        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-avatar">{member.avatar}</div>
              <h3 className="team-name">{member.name}</h3>
              <span className="team-role">{member.role}</span>
              <p className="team-desc">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">함께 시작해볼까요?</h2>
          <p className="cta-text">
            지금 바로 MyViteProject의 강력한 기능들을 경험해보세요.
          </p>
          <div className="cta-buttons">
            <button
              className="cta-primary-button"
              onClick={() => navigate("/user/search")}
            >
              사용자 목록 →
            </button>
            <button
              className="cta-secondary-button"
              onClick={() => navigate("/home")}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
