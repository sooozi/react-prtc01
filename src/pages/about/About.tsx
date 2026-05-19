import { useNavigate } from "react-router-dom";
import { Button, PageHeader } from "@/components";
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
        <PageHeader
          badge="ℹ️ About project"
          title={
            <>
              Vite + React로 <span className="gradient-text">UI·API</span> 연습
            </>
          }
          titleId="about-hero-title"
          subtitle="React + TypeScript로 UI 컴포넌트·상태 관리·라우팅·API 연동까지 한 흐름으로 정리한 프론트엔드 포트폴리오 프로젝트입니다."
          variant="inline"
          as="div"
        />
      </section>

      <section className="mission-section" aria-labelledby="about-mission-heading">
        <h2 id="about-mission-heading" className="visually-hidden">
          목적과 범위
        </h2>
        <ul className="mission-grid">
          {missionCards.map((card) => (
            <li key={card.title} className="mission-card">
              <span className="mission-icon" aria-hidden>
                {card.icon}
              </span>
              <h3 className="mission-title">{card.title}</h3>
              <p className="mission-text">{card.text}</p>
            </li>
          ))}
        </ul>
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
        <ul className="scope-grid">
          {scopeHighlights.map((item) => (
            <li key={item.title}>
              <article className="scope-card">
                <div className="scope-icon" aria-hidden>
                  {item.icon}
                </div>
                <h3 className="scope-title">{item.title}</h3>
                <span className="scope-tag">{item.tag}</span>
                <p className="scope-desc">{item.description}</p>
              </article>
            </li>
          ))}
        </ul>
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
