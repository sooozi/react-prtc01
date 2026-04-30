import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button } from "@/components";
import "@/pages/Home.scss";

export default function Home() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const nodes = root.querySelectorAll<HTMLElement>("[data-home-section]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      nodes.forEach((el) => el.classList.add("home-reveal--visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("home-reveal--visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const features = [
    {
      icon: "📋",
      title: "게시판 & 첨부",
      description:
        "목록·상세·작성·수정과 이미지 첨부, 총 용량 표시·순서 조정까지 실무에 가까운 흐름을 다룹니다.",
    },
    {
      icon: "👤",
      title: "회원 & 인증",
      description: "회원가입·로그인, 사용자 목록·상세·마이페이지로 계정 기반 화면을 연습합니다.",
    },
    {
      icon: "📅",
      title: "일정 UI",
      description: "월 단위 달력, 주 시작(월/일) 전환 등 스케줄형 UI를 구성해 봅니다.",
    },
  ];

  const techStack = [
    { name: "Vite", desc: "빌드" },
    { name: "React 19", desc: "UI" },
    { name: "TypeScript", desc: "타입" },
    { name: "React Router", desc: "라우팅" },
    { name: "React Hook Form", desc: "폼" },
    { name: "Axios", desc: "HTTP" },
    { name: "clsx", desc: "클래스" },
    { name: "ESLint", desc: "품질" },
    { name: "SCSS", desc: "스타일" },
  ];

  const quickLinks = [
    { to: "/about", label: "소개", icon: "📄" },
    { to: "/post/list", label: "게시판", icon: "📋" },
    { to: "/post/write", label: "글쓰기", icon: "✏️" },
    { to: "/schedule", label: "일정", icon: "📅" },
    { to: "/auth/signup", label: "회원가입", icon: "📝" },
    { to: "/auth/login", label: "로그인", icon: "🔑" },
    { to: "/user/list", label: "사용자 목록", icon: "👥" },
    { to: "/user/mypage", label: "마이페이지", icon: "👤" },
  ];

  return (
    <div className="home-page" ref={pageRef}>
      <section className="hero" aria-labelledby="home-hero-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <Badge>연습 프로젝트</Badge>
            <h1 id="home-hero-title" className="hero-title">
              더 빠르고, 더 아름다운
              <br />
              <span className="gradient-text">개발 경험</span>
            </h1>
            <p className="hero-description">
              Vite · React · TypeScript 기반으로 게시판·회원·일정 UI를 붙여 본 저장소입니다.
              <br />
              일부 메뉴는 로그인 후에 이용할 수 있어요.
            </p>
            <div className="hero-actions">
              <Button variant="primary" onClick={() => navigate("/auth/signup")}>
                회원가입
              </Button>
              <Button variant="secondary" onClick={() => navigate("/about")}>
                서비스 소개
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="features-section"
        data-home-section
        aria-labelledby="home-features-heading"
      >
        <h2 id="home-features-heading" className="section-title">
          주요 기능
        </h2>
        <ul className="features-grid">
          {features.map((feature) => (
            <li key={feature.title} className="feature-card">
              <span className="feature-icon" aria-hidden>
                {feature.icon}
              </span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="tech-section" data-home-section aria-labelledby="home-tech-heading">
        <h2 id="home-tech-heading" className="section-title">
          기술 스택
        </h2>
        <ul className="tech-grid" aria-label="이 프로젝트에서 쓰는 기술">
          {techStack.map((tech) => (
            <li key={tech.name} className="tech-chip">
              <span className="tech-name">{tech.name}</span>
              <span className="tech-desc">{tech.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="links-section" data-home-section aria-labelledby="home-sitemap-heading">
        <h2 id="home-sitemap-heading" className="section-title">
          사이트맵
        </h2>
        <p className="links-section__subline">
          원하는 페이지로 이동하세요. 게시판·일정 등은 로그인이 필요할 수 있어요.
        </p>
        <ul className="links-grid">
          {quickLinks.map((link) => (
            <li key={link.to}>
              <button
                type="button"
                className="link-card"
                onClick={() => navigate(link.to)}
                aria-label={`${link.label} 페이지로 이동`}
              >
                <span className="link-icon" aria-hidden>
                  {link.icon}
                </span>
                <span className="link-label">{link.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
