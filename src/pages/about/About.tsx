import { useNavigate } from "react-router-dom";
import { Badge, Button } from "@/components";
import "@/pages/about/About.scss";

export default function About() {
  const navigate = useNavigate();

  const missionCards = [
    {
      icon: "🎯",
      title: "목적",
      text: "Vite·React·TypeScript로 실제에 가까운 화면을 만들며, REST API·폼·라우팅·스타일링을 한곳에서 연습합니다.",
    },
    {
      icon: "🧭",
      title: "범위",
      text: "백엔드는 별도 서버를 두고, 프론트에서 인증·게시판·첨부·일정 UI를 붙여 동작을 확인하는 구조입니다.",
    },
  ];

  const techStack = [
    { name: "React 19", icon: "⚛️" },
    { name: "TypeScript", icon: "📘" },
    { name: "Vite", icon: "⚡" },
    { name: "React Router", icon: "🔀" },
    { name: "React Hook Form", icon: "📋" },
    { name: "Axios", icon: "🌐" },
    { name: "SCSS", icon: "🎨" },
    { name: "ESLint", icon: "✅" },
  ];

  const scopeHighlights = [
    {
      icon: "📋",
      title: "게시판 & 첨부",
      tag: "API 연동",
      description: "목록·상세·작성·수정과 이미지 첨부, 용량·순서 조정 등 파일 업로드 흐름을 다룹니다.",
    },
    {
      icon: "👤",
      title: "회원 & 사용자",
      tag: "인증·목록",
      description: "가입·로그인, 사용자 목록·상세, 마이페이지로 계정 기반 화면을 구성합니다.",
    },
    {
      icon: "📅",
      title: "일정",
      tag: "UI 컴포넌트",
      description: "월 단위 달력·주 시작 전환 등 스케줄형 인터페이스를 쌓아 봅니다.",
    },
  ];

  return (
    <div className="about-page">
      <section className="hero-section" aria-labelledby="about-hero-title">
        <Badge>프로젝트 소개</Badge>
        <h1 id="about-hero-title" className="title">
          Vite + React로 <span className="gradient-text">UI·API</span> 연습
        </h1>
        <p className="subtitle">
          개인 연습용 프론트 저장소입니다. 로컬 실행·환경 변수는 저장소 README를 참고하세요.
          <br />
          게시판·마이페이지·일정 등은 로그인과 백엔드가 준비된 뒤 가장 잘 맞습니다.
        </p>
      </section>

      <section className="mission-section" aria-labelledby="about-mission-heading">
        <h2 id="about-mission-heading" className="visually-hidden">
          목적과 범위
        </h2>
        <div className="mission-grid">
          {missionCards.map((card) => (
            <div key={card.title} className="mission-card">
              <span className="mission-icon" aria-hidden>
                {card.icon}
              </span>
              <h3 className="mission-title">{card.title}</h3>
              <p className="mission-text">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tech-section" aria-labelledby="about-tech-heading">
        <h2 id="about-tech-heading" className="section-title">
          기술 스택
        </h2>
        <ul className="tech-grid" aria-label="주요 기술 목록">
          {techStack.map((tech) => (
            <li key={tech.name} className="tech-card">
              <span className="tech-icon" aria-hidden>
                {tech.icon}
              </span>
              <span className="tech-name">{tech.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="scope-section" aria-labelledby="about-scope-heading">
        <h2 id="about-scope-heading" className="section-title">
          연습 범위
        </h2>
        <div className="scope-grid">
          {scopeHighlights.map((item) => (
            <article key={item.title} className="scope-card">
              <div className="scope-icon" aria-hidden>
                {item.icon}
              </div>
              <h3 className="scope-title">{item.title}</h3>
              <span className="scope-tag">{item.tag}</span>
              <p className="scope-desc">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section" aria-labelledby="about-cta-title">
        <div className="cta-card">
          <h2 id="about-cta-title" className="cta-title">
            화면 둘러보기
          </h2>
          <p className="cta-text">자주 쓰는 메뉴로 바로 이동해 보세요.</p>
          <div className="cta-buttons">
            <Button variant="primaryInverse" onClick={() => navigate("/home")}>
              홈
            </Button>
            <Button variant="primaryInverse" onClick={() => navigate("/post/list")}>
              게시판
            </Button>
            <Button variant="secondaryInverse" onClick={() => navigate("/user/list")}>
              사용자 목록
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
