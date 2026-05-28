import clsx from "clsx";
import { useEffect, useId, useState } from "react";
import {
  Badge,
  Button,
  Confirm,
  LoadingState,
  PageHeader,
  Pagination,
  PostDetailDataSkeleton,
} from "@/components";
import { SgSection } from "@/pages/style-guide/components/SgSection";
import {
  COLOR_SCHEME_GRID,
  COLOR_SEMANTIC_SWATCHES,
  type ColorSchemeCell,
  FONT_WEIGHTS,
  RADIUS_SCALE,
  SPACING_SCALE,
  TYPE_SCALE,
} from "@/pages/style-guide/styleGuideTokens";
import "@/pages/style-guide/StyleGuide.scss";

const NAV_ANCHORS = [
  { href: "#sg-hero", label: "Intro" },
  { href: "#sg-type", label: "Typography" },
  { href: "#sg-color", label: "Colors" },
  { href: "#sg-tokens", label: "Tokens" },
  { href: "#sg-components", label: "Components" },
  { href: "#sg-preview", label: "UI Preview" },
  { href: "#sg-theme", label: "Themes" },
] as const;

function ColorSchemeCellView({ cell }: { cell: ColorSchemeCell }) {
  const tone = cell.tone ?? "on-color";

  return (
    <div
      className={clsx(
        "sg-color-scheme__cell",
        cell.spanRows === 2 && "sg-color-scheme__cell--span-rows",
        tone === "ink" && "sg-color-scheme__cell--ink"
      )}
      style={{ backgroundColor: `var(${cell.cssVar})` }}
    >
      {cell.eyebrow ? <span className="sg-color-scheme__eyebrow">{cell.eyebrow}</span> : null}
      <span className="sg-color-scheme__label">{cell.name}</span>
      <span className="sg-color-scheme__hex">{cell.hex}</span>
    </div>
  );
}

function ColorSchemeBoard() {
  return (
    <div className="sg-color-system">
      <div className="sg-color-scheme" role="img" aria-label="프로젝트 컬러 스킴">
        {COLOR_SCHEME_GRID.map((cell) => (
          <ColorSchemeCellView key={cell.cssVar} cell={cell} />
        ))}
      </div>
      <div className="sg-color-semantic" aria-label="시맨틱 컬러">
        {COLOR_SEMANTIC_SWATCHES.map((cell) => (
          <ColorSchemeCellView key={cell.cssVar} cell={cell} />
        ))}
      </div>
    </div>
  );
}

function MockTabs() {
  const baseId = useId();
  const [active, setActive] = useState<"all" | "notice" | "qna">("all");
  const tabs = [
    { id: "all" as const, label: "전체" },
    { id: "notice" as const, label: "공지" },
    { id: "qna" as const, label: "Q&A" },
  ];

  return (
    <div className="sg-tabs" role="tablist" aria-label="게시판 분류">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`${baseId}-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`${baseId}-panel`}
          className={active === tab.id ? "sg-tabs__tab is-active" : "sg-tabs__tab"}
          onClick={() => setActive(tab.id)}
        >
          {tab.label}
        </button>
      ))}
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-${active}`}
        className="sg-tabs__panel"
      >
        {active === "all" && "전체 게시글 목록을 표시합니다."}
        {active === "notice" && "공지사항만 필터링합니다."}
        {active === "qna" && "Q&A 게시글만 표시합니다."}
      </div>
    </div>
  );
}

function MockToast() {
  return (
    <div className="sg-toast" role="status">
      <span className="sg-toast__icon" aria-hidden>
        ✓
      </span>
      <span className="sg-toast__text">저장되었습니다.</span>
    </div>
  );
}

function MockCommentCard() {
  return (
    <article className="sg-comment-card">
      <div className="sg-comment-card__avatar" aria-hidden>
        A
      </div>
      <div className="sg-comment-card__body">
        <header className="sg-comment-card__head">
          <span className="sg-comment-card__author">alex.dev</span>
          <time className="sg-comment-card__time" dateTime="2025-05-28">
            2시간 전
          </time>
        </header>
        <p className="sg-comment-card__text">
          디자인 토큰 기반으로 카드·spacing을 맞추면 페이지 간 일관성이 좋아집니다.
        </p>
      </div>
    </article>
  );
}

function DashboardWidget() {
  return (
    <div className="sg-widget sg-widget--stat">
      <p className="sg-widget__label">이번 주 조회수</p>
      <p className="sg-widget__value">12,480</p>
      <p className="sg-widget__delta sg-widget__delta--up">+18.2%</p>
      <div className="sg-widget__bars" aria-hidden>
        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
          <span key={i} className="sg-widget__bar" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function BoardPreviewMock() {
  return (
    <div className="sg-board-preview">
      <div className="sg-board-preview__toolbar">
        <span className="sg-board-preview__title">게시판</span>
        <Button variant="primary" size="sm">
          글쓰기
        </Button>
      </div>
      <table className="sg-board-preview__table">
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">제목</th>
            <th scope="col">작성자</th>
            <th scope="col">조회</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>42</td>
            <td>Style Guide 페이지 오픈</td>
            <td>admin</td>
            <td>128</td>
          </tr>
          <tr>
            <td>41</td>
            <td>디자인 토큰 정리 노트</td>
            <td>dev</td>
            <td>86</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CalendarPreviewMock() {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const cells = Array.from({ length: 35 }, (_, i) => i + 1);

  return (
    <div className="sg-calendar-preview" aria-label="달력 미리보기">
      <div className="sg-calendar-preview__head">
        <span className="sg-calendar-preview__month">2025년 5월</span>
      </div>
      <div className="sg-calendar-preview__grid">
        {days.map((d) => (
          <span key={d} className="sg-calendar-preview__dow">
            {d}
          </span>
        ))}
        {cells.map((n) => (
          <span
            key={n}
            className={
              n === 28 ? "sg-calendar-preview__day is-today" : "sg-calendar-preview__day"
            }
          >
            {n <= 31 ? n : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function ThemePreviewPanel({ theme }: { theme: "light" | "dark" }) {
  return (
    <div className="sg-theme-panel" data-theme={theme}>
      <div className="sg-theme-panel__inner">
        <p className="sg-theme-panel__mode">{theme === "light" ? "Light" : "Dark"}</p>
        <div className="sg-theme-panel__card">
          <span className="sg-theme-panel__badge">Badge</span>
          <h3 className="sg-theme-panel__title">카드 제목</h3>
          <p className="sg-theme-panel__body">본문과 보조 텍스트 계층을 확인합니다.</p>
          <div className="sg-theme-panel__actions">
            <Button variant="primary" size="sm">
              Primary
            </Button>
            <Button variant="secondary" size="sm">
              Secondary
            </Button>
          </div>
        </div>
        <label className="sg-theme-panel__field">
          <span className="sg-theme-panel__label">Input</span>
          <input type="text" className="input" placeholder="placeholder" />
        </label>
      </div>
    </div>
  );
}

export default function StyleGuide() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [activeAnchor, setActiveAnchor] = useState<string>(NAV_ANCHORS[0].href);

  useEffect(() => {
    const sectionIds = NAV_ANCHORS.map((item) => item.href.slice(1));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target.id) {
          setActiveAnchor(`#${top.target.id}`);
        }
      },
      {
        root: null,
        rootMargin: "-42% 0px -48% 0px",
        threshold: [0, 0.15, 0.35, 0.55],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="style-guide-page">
      <div className="sg-ambient" aria-hidden>
        <span className="sg-ambient__orb sg-ambient__orb--1" />
        <span className="sg-ambient__orb sg-ambient__orb--2" />
        <span className="sg-ambient__orb sg-ambient__orb--3" />
        <span className="sg-ambient__orb sg-ambient__orb--4" />
      </div>

      <section id="sg-hero" className="sg-hero" aria-labelledby="sg-hero-title">
        <PageHeader
          badge="Visual System"
          title="Style Guide"
          titleId="sg-hero-title"
          subtitle="디자인 토큰과 컴포넌트, 실제 UI 리듬을 한눈에 보여주는 시스템 쇼케이스입니다."
        />
        <div className="sg-hero__actions">
          <Button variant="primary" onClick={() => document.getElementById("sg-components")?.scrollIntoView({ behavior: "smooth" })}>
            컴포넌트 보기
          </Button>
          <Button variant="secondary" onClick={() => document.getElementById("sg-color")?.scrollIntoView({ behavior: "smooth" })}>
            컬러 팔레트
          </Button>
        </div>
      </section>

      <nav className="sg-jump" aria-label="스타일 가이드 목차">
        <div className="sg-jump__inner">
          <ul className="sg-jump__list">
            {NAV_ANCHORS.map((item) => (
              <li key={item.href} className="sg-jump__item">
                <a
                  href={item.href}
                  className={
                    activeAnchor === item.href ? "sg-jump__link is-active" : "sg-jump__link"
                  }
                  aria-current={activeAnchor === item.href ? "location" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="sg-content">
        <SgSection
          id="sg-type"
          label="01 · Typography"
          title="타이포그래피"
          description="정보 전달 중심의 계층. 제목·본문·캡션·메타의 위계와 line-height를 통일합니다."
        >
          <div className="sg-type-hero">
            <div className="sg-type-hero__glyph" aria-hidden>
              <span className="sg-type-hero__aa">Aa</span>
              <span className="sg-type-hero__orb" />
            </div>
            <div className="sg-type-hero__weights">
              <p className="sg-type-hero__family">Pretendard · Noto Sans KR · system-ui</p>
              {FONT_WEIGHTS.map((w) => (
                <p key={w.label} className="sg-type-hero__row" style={{ fontWeight: w.weight }}>
                  <span className="sg-type-hero__wlabel">{w.label}</span>
                  <span>Aa 가나다 123</span>
                </p>
              ))}
            </div>
          </div>

          <ul className="sg-type-scale">
            {TYPE_SCALE.map((row) => (
              <li key={row.label} className="sg-type-scale__row">
                <div className="sg-type-scale__meta">
                  <span className="sg-type-scale__label">{row.label}</span>
                  <code>v.fs({row.token})</code>
                </div>
                <p className={`sg-type-scale__sample sg-type-scale__sample--${row.token}`}>
                  {row.sample}
                </p>
              </li>
            ))}
          </ul>
        </SgSection>

        <SgSection
          id="sg-color"
          label="02 · Colors"
          title="컬러 시스템"
          description="포인트 컬러는 CTA·링크·활성 상태에만 사용하고, 나머지는 neutral surface로 구성합니다."
        >
          <ColorSchemeBoard />
        </SgSection>

        <SgSection
          id="sg-tokens"
          label="03 · Tokens"
          title="Spacing · Radius · Elevation"
          description="SCSS v.space(), v.rad(), shadow mixin과 1:1로 대응하는 시각 레퍼런스입니다."
        >
          <div className="sg-token-grid">
            <article className="sg-panel">
              <h3 className="sg-panel__title">Spacing</h3>
              <ul className="sg-spacing-list">
                {SPACING_SCALE.map((s) => (
                  <li key={s.key} className="sg-spacing-list__item">
                    <span className="sg-spacing-list__bar" style={{ width: s.rem }} />
                    <span className="sg-spacing-list__key">{s.key}</span>
                    <span className="sg-spacing-list__val">
                      {s.rem} · {s.px}px
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="sg-panel">
              <h3 className="sg-panel__title">Radius</h3>
              <ul className="sg-radius-list">
                {RADIUS_SCALE.map((r) => (
                  <li key={r.key} className="sg-radius-list__item">
                    <span className="sg-radius-list__box" style={{ borderRadius: `${r.px}px` }} />
                    <span>{r.px}px</span>
                    <span className="sg-radius-list__usage">{r.usage}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="sg-panel sg-panel--wide">
              <h3 className="sg-panel__title">Elevation</h3>
              <div className="sg-elevation-row">
                <div className="sg-elevation-card sg-elevation-card--border">Border only</div>
                <div className="sg-elevation-card sg-elevation-card--surface">card-surface</div>
                <div className="sg-elevation-card sg-elevation-card--cta">Primary CTA shadow</div>
              </div>
              <p className="sg-panel__hint">
                정보 카드는 border + card-surface. CTA·모달만 제한적으로 elevation을 사용합니다.
              </p>
            </article>
          </div>
        </SgSection>

        <SgSection
          id="sg-components"
          label="04 · Components"
          title="컴포넌트 쇼케이스"
          description="프로젝트에서 실제 사용 중인 UI를 그리드에 배치했습니다."
        >
          <div className="sg-showcase-grid">
            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Button</h3>
              <div className="sg-showcase-card__stack">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="primary" size="sm">
                  Small
                </Button>
              </div>
            </article>

            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Input · Select</h3>
              <div className="sg-showcase-card__stack">
                <label className="sg-field">
                  <span className="sg-field__label">Label</span>
                  <input type="text" className="input" placeholder="텍스트 입력" />
                </label>
                <label className="sg-field">
                  <span className="sg-field__label">Select</span>
                  <select className="input sg-select" defaultValue="a">
                    <option value="a">옵션 A</option>
                    <option value="b">옵션 B</option>
                  </select>
                </label>
              </div>
            </article>

            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Badge · Tabs</h3>
              <div className="sg-showcase-card__stack">
                <Badge>New</Badge>
                <MockTabs />
              </div>
            </article>

            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Card</h3>
              <div className="sg-demo-card">
                <h4>게시글 카드</h4>
                <p>border + card-surface-shell 패턴</p>
                <Button variant="secondary" size="sm">
                  자세히
                </Button>
              </div>
            </article>

            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Modal</h3>
              <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                Confirm 열기
              </Button>
              <Confirm
                open={confirmOpen}
                message="삭제하시겠습니까?"
                variant="danger"
                confirmLabel="삭제"
                onConfirm={() => setConfirmOpen(false)}
                onCancel={() => setConfirmOpen(false)}
              />
            </article>

            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Pagination</h3>
              <Pagination currentPage={page} totalPages={12} onPageChange={setPage} />
            </article>

            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Toast</h3>
              <MockToast />
            </article>

            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Loading · Empty</h3>
              <LoadingState message="불러오는 중…" variant="compact" />
              <div className="sg-empty" role="status">
                <span className="sg-empty__icon" aria-hidden>
                  📭
                </span>
                <p>표시할 데이터가 없습니다.</p>
              </div>
            </article>

            <article className="sg-showcase-card sg-showcase-card--wide">
              <h3 className="sg-showcase-card__title">Skeleton</h3>
              <div className="sg-skeleton-wrap">
                <PostDetailDataSkeleton />
              </div>
            </article>

            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Comment</h3>
              <MockCommentCard />
            </article>
          </div>
        </SgSection>

        <SgSection
          id="sg-preview"
          label="05 · UI Preview"
          title="실서비스 UI 프리뷰"
          description="게시판·대시보드·일정·폼이 실제 화면에서 어떻게 보이는지 미리 봅니다."
          className="sg-section--flush"
        >
          <div className="sg-preview-bento">
            <div className="sg-preview-bento__main">
              <DashboardWidget />
              <BoardPreviewMock />
            </div>
            <div className="sg-preview-bento__side">
              <CalendarPreviewMock />
              <div className="sg-form-preview">
                <h3 className="sg-form-preview__title">빠른 문의</h3>
                <label className="sg-field">
                  <span className="sg-field__label">이름</span>
                  <input type="text" className="input" />
                </label>
                <label className="sg-field">
                  <span className="sg-field__label">내용</span>
                  <textarea className="input" rows={3} />
                </label>
                <Button variant="primary">제출</Button>
              </div>
              <div className="sg-comment-preview">
                <h3 className="sg-comment-preview__title">댓글</h3>
                <MockCommentCard />
              </div>
            </div>
          </div>
        </SgSection>

        <SgSection
          id="sg-theme"
          label="06 · Themes"
          title="라이트 · 다크 비교"
          description="data-theme 속성으로 전환합니다. 아래 패널은 페이지 테마와 독립적으로 미리보기합니다."
        >
          <div className="sg-theme-compare">
            <ThemePreviewPanel theme="light" />
            <ThemePreviewPanel theme="dark" />
          </div>
        </SgSection>
      </div>

      <footer className="sg-footer">
        <p>React Practice Design System · CSS variables + SCSS tokens</p>
      </footer>
    </div>
  );
}
