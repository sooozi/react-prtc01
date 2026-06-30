import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components";
import { HomeMarquee } from "@/pages/home/HomeMarquee";
import { COLOR_SCHEME_GRID, SPACING_SCALE } from "@/pages/style-guide/styleGuideTokens";
import { TestMainHeroDemo } from "@/pages/testmain/TestMainHeroDemo";
import "@/pages/testmain/TestMain.scss";

const DESIGN_PREVIEW_NAV = ["Type", "Color", "Token", "Theme"] as const;

const DESIGN_PREVIEW_SPACING = SPACING_SCALE.slice(0, 4);

const PAIN_POINTS = [
  {
    title: "서비스 흐름 설계",
    description:
      "게시판, 일정관리, 인증을\n하나의 사용자 흐름으로 연결해\n서비스처럼 동작하도록 구성했습니다.",
  },
  {
    title: "인증 및 권한 관리",
    description:
      "로그인, 토큰 관리,\n보호 라우팅, 마이페이지까지\n사용자 접근 흐름을 고려해 구현했습니다.",
  },
  {
    title: "디자인 시스템 구축",
    description:
      "공통 컴포넌트와 디자인 토큰을 정리해\n화면이 늘어나도 일관된 UI를 유지하도록 구성했습니다.",
  },
] as const;

const FEATURES = [
  {
    tag: "게시판",
    title: "게시판",
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
    title: "일정",
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
  {
    value: "10+",
    unit: "Stack",
    label: "기술 스택",
    sub: "Vite · React 19 · TypeScript 등",
    durationMs: 1500,
  },
  {
    value: "3",
    unit: "Modules",
    label: "핵심 모듈",
    sub: "게시판 · 회원 · 일정",
    durationMs: 1750,
  },
  {
    value: "2x",
    unit: "Faster",
    label: "개발 속도",
    sub: "공통 UI·라우팅 재사용",
    durationMs: 2000,
  },
] as const;

const DIGIT_ROLL_CYCLES = 2;

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

function buildDigitStrip(cycles: number): number[] {
  const length = (cycles + 1) * 10;
  return Array.from({ length }, (_, index) => index % 10);
}

function getDigitSettleOffset(digit: number, cycles: number): number {
  return cycles * 10 + digit;
}

function parseStatValue(value: string): { target: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return { target: 0, suffix: value };
  return { target: Number(match[1]), suffix: match[2] };
}

function DigitRoller({
  digit,
  durationMs,
  delay = 0,
  cycles = DIGIT_ROLL_CYCLES,
}: {
  digit: number;
  durationMs: number;
  delay?: number;
  cycles?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const settleOffset = getDigitSettleOffset(digit, cycles);
  const [offset, setOffset] = useState(() => {
    if (typeof window === "undefined") return 0;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? settleOffset : 0;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let timeoutId = 0;
    let cancelled = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();

        const run = () => {
          if (cancelled) return;
          const start = performance.now();

          const tick = (now: number) => {
            if (cancelled) return;
            const progress = Math.min((now - start) / durationMs, 1);
            setOffset(easeOutCubic(progress) * settleOffset);

            if (progress < 1) {
              rafId = requestAnimationFrame(tick);
            } else {
              setOffset(settleOffset);
            }
          };

          rafId = requestAnimationFrame(tick);
        };

        if (delay > 0) {
          timeoutId = window.setTimeout(run, delay);
        } else {
          run();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [delay, durationMs, settleOffset]);

  const strip = buildDigitStrip(cycles);

  return (
    <span className="testmain-stat__digit" ref={ref}>
      <span
        className="testmain-stat__digit-strip"
        style={{ transform: `translate3d(0, calc(-1 * ${offset} * 1lh), 0)` }}
      >
        {strip.map((value, index) => (
          <span key={index} className="testmain-stat__digit-cell">
            {value}
          </span>
        ))}
      </span>
    </span>
  );
}

function TestMainStatDigitRoll({
  value,
  durationMs,
  delay = 0,
}: {
  value: string;
  durationMs: number;
  delay?: number;
}) {
  const { target, suffix } = parseStatValue(value);
  const digits = String(target).split("").map(Number);

  return (
    <span
      className="testmain-stat__count testmain-stat__count--digits"
      aria-label={`${target}${suffix}`}
    >
      {digits.map((digit, index) => (
        <DigitRoller key={index} digit={digit} durationMs={durationMs} delay={delay} />
      ))}
      <span className="testmain-stat__count-suffix">{suffix}</span>
    </span>
  );
}

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

type BoardPreviewRow = {
  no: number;
  title: string;
  author: string;
  views: number;
  attach?: boolean;
  highlight?: boolean;
};

const BOARD_PREVIEW_ROWS: BoardPreviewRow[] = [
  {
    no: 12,
    title: "Vite 마이그레이션 후기",
    author: "김수지",
    views: 128,
    attach: true,
    highlight: true,
  },
  { no: 11, title: "React 19 상태 관리 정리", author: "이민호", views: 86 },
  { no: 10, title: "첨부 이미지 용량 테스트", author: "박지원", views: 42, attach: true },
  { no: 9, title: "일정 API 연동 노트", author: "최서연", views: 31 },
];

const SCHEDULE_PREVIEW_WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

type SchedulePreviewCell = {
  day: number;
  muted?: boolean;
  today?: boolean;
  event?: string;
  eventTone?: "meeting" | "personal" | "work";
};

const AUTH_PREVIEW_POSTS = [
  { title: "Vite 마이그레이션 후기", date: "2026-06-24" },
  { title: "React 19 상태 관리 정리", date: "2026-06-20" },
] as const;

const SCHEDULE_PREVIEW_CELLS: SchedulePreviewCell[] = [
  { day: 26, muted: true },
  { day: 27, muted: true },
  { day: 28, muted: true },
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 31, muted: true },
  { day: 1 },
  { day: 2 },
  { day: 3 },
  { day: 4, today: true, event: "회의", eventTone: "meeting" },
  { day: 5 },
  { day: 6, event: "리뷰", eventTone: "personal" },
  { day: 7 },
  { day: 8 },
  { day: 9 },
  { day: 10 },
  { day: 11, event: "배포", eventTone: "work" },
  { day: 12 },
  { day: 13 },
  { day: 14 },
];

function FeaturePreview({ type }: { type: (typeof FEATURES)[number]["preview"] }) {
  switch (type) {
    case "board":
      return (
        <div className="testmain-preview testmain-preview--board" aria-hidden>
          <div className="testmain-preview__board-toolbar">
            <div className="testmain-preview__board-search">
              <span className="testmain-preview__board-search-label">제목</span>
              <span className="testmain-preview__board-search-field" />
            </div>
            <span className="testmain-preview__board-search-btn">검색</span>
          </div>
          <div className="testmain-preview__board-actions">
            <span className="testmain-preview__board-write-btn">글쓰기</span>
          </div>
          <table className="testmain-preview__board-table">
            <thead>
              <tr>
                <th scope="col">번호</th>
                <th scope="col">제목</th>
                <th scope="col">등록자</th>
                <th scope="col">조회</th>
              </tr>
            </thead>
            <tbody>
              {BOARD_PREVIEW_ROWS.map((row) => (
                <tr key={row.no} className={row.highlight ? "is-highlight" : undefined}>
                  <td>{row.no}</td>
                  <td>
                    <span className="testmain-preview__board-title">{row.title}</span>
                    {row.attach ? (
                      <span className="testmain-preview__board-attach" aria-hidden>
                        첨부
                      </span>
                    ) : null}
                  </td>
                  <td>{row.author}</td>
                  <td>{row.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "auth":
      return (
        <div className="testmain-preview testmain-preview--auth" aria-hidden>
          <div className="testmain-preview__auth-grid">
            <div className="testmain-preview__auth-login">
              <div className="testmain-preview__auth-login-head">
                <span className="testmain-preview__auth-badge">Login</span>
                <span className="testmain-preview__auth-login-title">로그인</span>
              </div>
              <div className="testmain-preview__auth-field">
                <span className="testmain-preview__auth-label">아이디</span>
                <span className="testmain-preview__auth-input">practice_user</span>
              </div>
              <div className="testmain-preview__auth-field">
                <span className="testmain-preview__auth-label">비밀번호</span>
                <span className="testmain-preview__auth-input testmain-preview__auth-input--password">
                  ••••••••
                </span>
              </div>
              <span className="testmain-preview__auth-submit">로그인</span>
              <span className="testmain-preview__auth-signup">
                계정이 없으신가요? <em>회원가입</em>
              </span>
            </div>

            <div className="testmain-preview__auth-mypage">
              <div className="testmain-preview__auth-mypage-head">
                <span className="testmain-preview__auth-badge testmain-preview__auth-badge--mypage">
                  👤 MyPage
                </span>
                <span className="testmain-preview__auth-mypage-greeting">
                  안녕하세요, <em>김수지</em>님
                </span>
              </div>
              <div className="testmain-preview__auth-profile">
                <span className="testmain-preview__auth-profile-title">기본 정보</span>
                <div className="testmain-preview__auth-profile-row">
                  <span>아이디</span>
                  <span>practice_user</span>
                </div>
                <div className="testmain-preview__auth-profile-row">
                  <span>이름</span>
                  <span>김수지</span>
                </div>
              </div>
              <div className="testmain-preview__auth-profile testmain-preview__auth-profile--compact">
                <div className="testmain-preview__auth-profile-row">
                  <span>계정 상태</span>
                  <span className="is-ok">정상</span>
                </div>
              </div>
              <div className="testmain-preview__auth-posts-head">
                <span className="testmain-preview__auth-profile-title">내가 쓴 글</span>
                <span className="testmain-preview__auth-posts-count">
                  {AUTH_PREVIEW_POSTS.length}건
                </span>
              </div>
              {AUTH_PREVIEW_POSTS.map((post) => (
                <div key={post.title} className="testmain-preview__auth-post-item">
                  <span className="testmain-preview__auth-post-title">{post.title}</span>
                  <span className="testmain-preview__auth-post-date">{post.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "schedule":
      return (
        <div className="testmain-preview testmain-preview--schedule" aria-hidden>
          <div className="testmain-preview__schedule-toolbar">
            <span className="testmain-preview__schedule-nav" />
            <span className="testmain-preview__schedule-title">2026년 6월</span>
            <span className="testmain-preview__schedule-nav" />
          </div>
          <div className="testmain-preview__schedule-weekdays">
            {SCHEDULE_PREVIEW_WEEKDAYS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="testmain-preview__schedule-grid">
            {SCHEDULE_PREVIEW_CELLS.map((cell) => (
              <div
                key={`${cell.day}-${cell.muted ? "m" : "c"}`}
                className={[
                  "testmain-preview__schedule-cell",
                  cell.muted ? "is-muted" : "",
                  cell.today ? "is-today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="testmain-preview__schedule-day">{cell.day}</span>
                {cell.event ? (
                  <span
                    className={[
                      "testmain-preview__schedule-event",
                      cell.eventTone ? `testmain-preview__schedule-event--${cell.eventTone}` : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {cell.event}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      );
    case "design":
      return (
        <div className="testmain-preview testmain-preview--design" aria-hidden>
          <nav className="testmain-preview__design-jump">
            {DESIGN_PREVIEW_NAV.map((item) => (
              <span key={item} className={item === "Color" ? "is-active" : undefined}>
                {item}
              </span>
            ))}
          </nav>
          <div className="testmain-preview__design-grid">
            <div className="testmain-preview__design-colors" role="img" aria-label="컬러 스킴">
              {COLOR_SCHEME_GRID.map((cell) => (
                <span
                  key={cell.cssVar}
                  className={[
                    "testmain-preview__design-swatch",
                    cell.spanRows === 2 ? "testmain-preview__design-swatch--primary" : "",
                    cell.tone === "ink" ? "is-ink" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ backgroundColor: `var(${cell.cssVar})` }}
                >
                  <span className="testmain-preview__design-swatch-label">{cell.name}</span>
                </span>
              ))}
            </div>
            <div className="testmain-preview__design-side">
              <div className="testmain-preview__design-panel">
                <span className="testmain-preview__design-panel-title">Spacing</span>
                <ul className="testmain-preview__design-spacing">
                  {DESIGN_PREVIEW_SPACING.map((spacing) => (
                    <li key={spacing.key}>
                      <span
                        className="testmain-preview__design-spacing-bar"
                        style={{ width: spacing.rem }}
                      />
                      <span className="testmain-preview__design-spacing-key">{spacing.key}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="testmain-preview__design-panel">
                <span className="testmain-preview__design-panel-title">Components</span>
                <div className="testmain-preview__design-components">
                  <span className="testmain-preview__design-btn testmain-preview__design-btn--primary">
                    Primary
                  </span>
                  <span className="testmain-preview__design-btn testmain-preview__design-btn--secondary">
                    Secondary
                  </span>
                  <span className="testmain-preview__design-badge">Badge</span>
                </div>
              </div>
            </div>
          </div>
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

    const nodes = root.querySelectorAll<HTMLElement>(
      "[data-testmain-reveal], [data-testmain-reveal-title], [data-testmain-reveal-desc]",
    );
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
              <span>게시판 · 일정관리 · 인증</span>
              <span>디자인 시스템 · 반응형 UI</span>
            </p>
            <h1 id="testmain-hero-title" className="testmain-hero__headline">
              <span className="testmain-hero__headline-line">사용자를 위한</span>
              <span className="testmain-hero__headline-line">더 나은 경험</span>
            </h1>
          </div>
          <div className="testmain-hero__demo-slot">
            <TestMainHeroDemo />
          </div>
        </div>
      </section>

      <section className="testmain-intro" aria-labelledby="testmain-intro-title">
        <h2 id="testmain-intro-title" className="testmain-intro__title" data-testmain-reveal-title>
          하나의 서비스를
          <br />
          처음부터 끝까지 구현했습니다.
        </h2>
        <p className="testmain-section-desc" data-testmain-reveal-desc>
          인증, 게시판, 일정관리, 디자인 시스템까지
          <br />
          실제 서비스 흐름을 고려해
          <br />
          하나의 프로젝트로 완성했습니다.
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

      <section className="testmain-features" aria-labelledby="testmain-features-heading">
        <div className="testmain-section-head">
          <p className="testmain-eyebrow">한 프로젝트에서 한눈에</p>
          <h2
            id="testmain-features-heading"
            className="testmain-section-head__title"
            data-testmain-reveal-title
          >
            연습 화면을 보고 바로 이동하세요
          </h2>
          <p className="testmain-section-desc" data-testmain-reveal-desc>
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

      <section className="testmain-stats" aria-labelledby="testmain-stats-heading">
        <div className="testmain-section-head testmain-section-head--light">
          <h2
            id="testmain-stats-heading"
            className="testmain-section-head__title"
            data-testmain-reveal-title
          >
            모두를 위한 프론트엔드 연습
          </h2>
          <p className="testmain-section-desc" data-testmain-reveal-desc>
            개별 기능 연습을 넘어, 하나의 앱 흐름으로 이어집니다.
          </p>
        </div>
        <ul className="testmain-stats__grid">
          {STATS.map((stat, index) => (
            <li key={stat.label} className="testmain-stat">
              <p className="testmain-stat__value">
                <TestMainStatDigitRoll
                  value={stat.value}
                  durationMs={stat.durationMs}
                  delay={index * 150}
                />
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

      <section className="testmain-faq" aria-labelledby="testmain-faq-heading">
        <h2
          id="testmain-faq-heading"
          className="testmain-section-head__title"
          data-testmain-reveal-title
        >
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

      <section className="testmain-cta" aria-labelledby="testmain-cta-heading">
        <h2 id="testmain-cta-heading" className="testmain-cta__title" data-testmain-reveal-title>
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
