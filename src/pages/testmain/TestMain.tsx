import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components";
import { HomeMarquee } from "@/pages/home/HomeMarquee";
import { TestMainHeroDemo } from "@/pages/testmain/TestMainHeroDemo";
import "@/pages/testmain/TestMain.scss";

const PAIN_POINTS = [
  {
    title: "실무형 UI 흐름 연습이 어려움",
    description:
      "튜토리얼만으로는 목록·상세·작성·수정 같은 실제 화면 전환과 상태 관리를 익히기 어렵습니다.",
  },
  {
    title: "인증·권한 흐름이 분산됨",
    description:
      "로그인, 토큰, 보호 라우트, 마이페이지가 각각 따로 놀면 전체 사용자 여정을 설계하기 힘듭니다.",
  },
  {
    title: "디자인 시스템 일관성 부족",
    description:
      "컴포넌트·토큰·다크 모드가 정리되지 않으면 화면이 늘어날수록 유지보수 비용이 커집니다.",
  },
] as const;

const FEATURES = [
  {
    tag: "게시판",
    title: "게시판 & 첨부",
    description:
      "목록·상세·작성·수정, 이미지 첨부, 총 용량 표시까지 실무에 가까운 CRUD 흐름을 연습합니다.",
    preview: "board",
  },
  {
    tag: "인증",
    title: "회원 & 인증",
    description: "회원가입·로그인, 사용자 목록·상세·마이페이지로 계정 기반 화면을 구성합니다.",
    preview: "auth",
  },
  {
    tag: "일정",
    title: "일정 UI",
    description: "월 단위 달력, 드래그 날짜 변경, 카테고리 색상 등 스케줄형 UI를 다룹니다.",
    preview: "schedule",
  },
  {
    tag: "디자인",
    title: "스타일 시스템",
    description: "SCSS 토큰, 다크 모드, Storybook으로 컴포넌트와 테마를 한곳에서 관리합니다.",
    preview: "design",
  },
] as const;

const STATS = [
  { value: "10+", unit: "Stack", label: "기술 스택", sub: "Vite · React 19 · TypeScript 등" },
  { value: "3", unit: "Modules", label: "핵심 모듈", sub: "게시판 · 회원 · 일정" },
  { value: "2x", unit: "Faster", label: "개발 속도", sub: "공통 UI·라우팅 재사용" },
] as const;

const MARQUEE_ITEMS = [
  { to: "/testmain", label: "Test Main" },
  { to: "/home", label: "기존 홈" },
  { to: "/post/list", label: "게시판" },
  { to: "/schedule", label: "일정" },
  { to: "/style-guide", label: "스타일 가이드" },
  { to: "/about", label: "소개" },
];

const FAQ_ITEMS = [
  {
    q: "Test Main 페이지는 무엇인가요?",
    a: "Flow AI 어드민 랜딩 페이지 레이아웃을 참고해 만든 메인 화면 디자인 시안입니다. 기존 /home 과 비교해 볼 수 있습니다.",
  },
  {
    q: "어떤 기능을 연습할 수 있나요?",
    a: "게시판 CRUD·첨부, 회원 인증·마이페이지, 월간 일정 달력 UI, SCSS 기반 디자인 시스템을 한 프로젝트에서 다룹니다.",
  },
  {
    q: "로그인 없이 접근 가능한가요?",
    a: "이 페이지와 소개·스타일 가이드·사용자 목록은 공개입니다. 게시판·일정·마이페이지는 로그인이 필요합니다.",
  },
  {
    q: "기존 홈과 어떻게 다른가요?",
    a: "기존 홈은 글리치 히어로·마퀴 중심의 실험적 랜딩이고, Test Main은 SaaS형 히어로·문제 정의·기능 카드·FAQ·CTA 구조를 따릅니다.",
  },
] as const;

const MARQUEE_FEATURES = [
  "게시판 목록·상세·작성",
  "이미지 첨부·용량 표시",
  "로그인·회원가입",
  "보호 라우트",
  "월간 일정 달력",
  "다크 모드",
  "Storybook UI 문서",
  "Zod 폼 검증",
];

function FeaturePreview({ type }: { type: (typeof FEATURES)[number]["preview"] }) {
  switch (type) {
    case "board":
      return (
        <div className="testmain-preview testmain-preview--board" aria-hidden>
          <div className="testmain-preview__bar" />
          <div className="testmain-preview__row" />
          <div className="testmain-preview__row testmain-preview__row--short" />
          <div className="testmain-preview__row" />
        </div>
      );
    case "auth":
      return (
        <div className="testmain-preview testmain-preview--auth" aria-hidden>
          <div className="testmain-preview__avatar" />
          <div className="testmain-preview__field" />
          <div className="testmain-preview__field" />
          <div className="testmain-preview__btn" />
        </div>
      );
    case "schedule":
      return (
        <div className="testmain-preview testmain-preview--schedule" aria-hidden>
          <div className="testmain-preview__cal-head" />
          <div className="testmain-preview__cal-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className={i === 4 ? "is-active" : undefined} />
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="testmain-preview testmain-preview--design" aria-hidden>
          <div className="testmain-preview__swatch" />
          <div className="testmain-preview__swatch" />
          <div className="testmain-preview__swatch" />
          <div className="testmain-preview__token" />
        </div>
      );
  }
}

export default function TestMain() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const nodes = root.querySelectorAll<HTMLElement>("[data-testmain-reveal]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      nodes.forEach((el) => el.classList.add("testmain-reveal--visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("testmain-reveal--visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="testmain-page" ref={pageRef}>
      <section className="testmain-hero" aria-labelledby="testmain-hero-title">
        <div className="testmain-hero__glow" aria-hidden />
        <div className="testmain-hero__inner">
          <div className="testmain-hero__copy">
            <p className="testmain-hero__eyebrow">
              <span>게시판부터 일정까지</span>
              <span>인증 · UI · 스타일 시스템까지</span>
            </p>
            <h1 id="testmain-hero-title" className="testmain-hero__headline">
              <span className="testmain-hero__headline-line">실무형</span>
              <span className="testmain-hero__headline-line">프론트엔드</span>
              <span className="testmain-hero__headline-line">연습의 완성</span>
            </h1>
          </div>
          <div className="testmain-hero__demo-slot">
            <TestMainHeroDemo />
          </div>
        </div>
      </section>

      <section
        className="testmain-intro"
        data-testmain-reveal
        aria-labelledby="testmain-intro-title"
      >
        <h2 id="testmain-intro-title" className="testmain-intro__title">
          실무형 화면을 연습하고,
          <br />
          제대로 관리하고 있나요?
        </h2>
        <p className="testmain-intro__desc">
          흩어진 튜토리얼, 인증 흐름의 공백, 일관되지 않은 UI는
          <br className="testmain-br-desktop" />
          학습 효율을 떨어뜨리고, 절반의 성과만을 만듭니다.
        </p>
        <div className="testmain-intro__actions">
          <Button variant="primary" size="md" onClick={() => navigate("/post/list")}>
            게시판 둘러보기
          </Button>
          <Button variant="outlinePrimary" size="md" onClick={() => navigate("/home")}>
            기존 홈 보기
          </Button>
        </div>
      </section>

      <section
        className="testmain-pain"
        data-testmain-reveal
        aria-labelledby="testmain-pain-heading"
      >
        <h2 id="testmain-pain-heading" className="visually-hidden">
          학습 과제
        </h2>
        <ul className="testmain-pain__grid">
          {PAIN_POINTS.map((item) => (
            <li key={item.title} className="testmain-pain__card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="testmain-features"
        data-testmain-reveal
        aria-labelledby="testmain-features-heading"
      >
        <div className="testmain-section-head">
          <p className="testmain-eyebrow">한 프로젝트에서 한눈에</p>
          <h2 id="testmain-features-heading" className="testmain-section-head__title">
            연습 화면을 보고 바로 이동하세요
          </h2>
          <p className="testmain-section-head__desc">
            게시판·인증·일정·디자인 시스템까지, 프론트엔드 실무에 필요한 흐름을 제공합니다.
          </p>
        </div>
        <ul className="testmain-features__grid">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="testmain-feature-card">
              <div className="testmain-feature-card__visual">
                <FeaturePreview type={feature.preview} />
              </div>
              <div className="testmain-feature-card__body">
                <span className="testmain-feature-card__tag">{feature.tag}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="testmain-stats"
        data-testmain-reveal
        aria-labelledby="testmain-stats-heading"
      >
        <div className="testmain-section-head testmain-section-head--light">
          <h2 id="testmain-stats-heading" className="testmain-section-head__title">
            모두를 위한 프론트엔드 연습
          </h2>
          <p className="testmain-section-head__desc">
            개별 기능 연습을 넘어, 하나의 앱 흐름으로 이어집니다.
          </p>
        </div>
        <ul className="testmain-stats__grid">
          {STATS.map((stat) => (
            <li key={stat.label} className="testmain-stat">
              <p className="testmain-stat__value">
                <span>{stat.value}</span>
                <small>{stat.unit}</small>
              </p>
              <h3>{stat.label}</h3>
              <p>{stat.sub}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="testmain-marquee-block" data-testmain-reveal>
        <div className="testmain-marquee-features" aria-hidden>
          <div className="testmain-marquee-features__track">
            {[...MARQUEE_FEATURES, ...MARQUEE_FEATURES].map((label, i) => (
              <span key={`${label}-${i}`}>{label}</span>
            ))}
          </div>
        </div>
        <HomeMarquee items={MARQUEE_ITEMS} />
      </div>

      <section className="testmain-faq" data-testmain-reveal aria-labelledby="testmain-faq-heading">
        <h2 id="testmain-faq-heading" className="testmain-section-head__title">
          자주하는 질문
        </h2>
        <ul className="testmain-faq__list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            const panelId = `testmain-faq-panel-${index}`;
            const triggerId = `testmain-faq-trigger-${index}`;

            return (
              <li key={item.q} className={`testmain-faq__item${isOpen ? " is-open" : ""}`}>
                <button
                  id={triggerId}
                  type="button"
                  className="testmain-faq__trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <span className="testmain-faq__question">{item.q}</span>
                  <span className="testmain-faq__icon" aria-hidden />
                </button>
                <div
                  id={panelId}
                  className="testmain-faq__panel"
                  role="region"
                  aria-labelledby={triggerId}
                  aria-hidden={!isOpen}
                >
                  <div className="testmain-faq__panel-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="testmain-cta" data-testmain-reveal aria-labelledby="testmain-cta-heading">
        <h2 id="testmain-cta-heading" className="testmain-cta__title">
          업무의 모든 순간을 코드와 함께
        </h2>
        <div className="testmain-cta__actions">
          <Button variant="primaryInverse" size="md" onClick={() => navigate("/auth/signup")}>
            무료로 시작하기
          </Button>
          <Button variant="secondaryInverse" size="md" onClick={() => navigate("/about")}>
            소개 보기
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="testmain-cta__ghost"
            onClick={() => navigate("/style-guide")}
          >
            스타일 가이드
          </Button>
        </div>
      </section>
    </div>
  );
}
