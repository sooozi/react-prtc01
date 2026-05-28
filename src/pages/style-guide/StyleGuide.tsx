import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Confirm,
  LoadingState,
  PageHeader,
  Pagination,
  PostDetailDataSkeleton,
} from "@/components";
import {
  SgBoardPreview,
  SgCalendarPreview,
  SgColorSchemeBoard,
  SgDashboardWidget,
  SgEmptyState,
  SgFormPreview,
  SgLiquidGlass,
  SgPreviewCommentCard,
  SgPreviewTabs,
  SgPreviewToast,
  SgSection,
  SgThemePreviewPanel,
} from "@/pages/style-guide/components";
import { FONT_WEIGHTS, RADIUS_SCALE, SPACING_SCALE, TYPE_SCALE } from "@/pages/style-guide/styleGuideTokens";
import "@/pages/style-guide/StyleGuide.scss";

const NAV_ANCHORS = [
  { href: "#sg-hero", label: "Intro" },
  { href: "#sg-type", label: "Typography" },
  { href: "#sg-color", label: "Colors" },
  { href: "#sg-tokens", label: "Tokens" },
  { href: "#sg-components", label: "Components" },
  { href: "#sg-preview", label: "UI Preview" },
  { href: "#sg-theme", label: "Themes" },
  { href: "#sg-glass", label: "Glass" },
] as const;

export default function StyleGuide() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = document.querySelectorAll<HTMLElement>(".sg-section");
    if (nodes.length === 0) return;

    if (reduced) {
      nodes.forEach((el) => el.classList.add("sg-reveal--visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("sg-reveal--visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -18% 0px" }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="style-guide-page">
      <div className="style-guide-page__masthead">
        <div id="sg-hero" className="style-guide-page__intro">
          <PageHeader
            badge="🎛️ Visual System"
            title="Style Guide"
            titleId="sg-hero-title"
            subtitle="디자인 토큰과 컴포넌트, 실제 UI 리듬을 한눈에 보여주는 시스템 쇼케이스입니다."
          />
        </div>

        <nav className="sg-jump" aria-label="스타일 가이드 목차">
          <ul className="sg-jump__list">
            {NAV_ANCHORS.map((item) => (
              <li key={item.href} className="sg-jump__item">
                <a
                  href={item.href}
                  className="sg-jump__link"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
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
          <SgColorSchemeBoard />
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
                <SgPreviewTabs />
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
              <SgPreviewToast />
            </article>

            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Loading · Empty</h3>
              <LoadingState message="불러오는 중…" variant="compact" />
              <SgEmptyState />
            </article>

            <article className="sg-showcase-card sg-showcase-card--wide">
              <h3 className="sg-showcase-card__title">Skeleton</h3>
              <div className="sg-skeleton-wrap">
                <PostDetailDataSkeleton />
              </div>
            </article>

            <article className="sg-showcase-card">
              <h3 className="sg-showcase-card__title">Comment</h3>
              <SgPreviewCommentCard />
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
              <SgDashboardWidget />
              <SgBoardPreview />
            </div>
            <div className="sg-preview-bento__side">
              <SgCalendarPreview />
              <SgFormPreview />
              <div className="sg-comment-preview">
                <h3 className="sg-comment-preview__title">댓글</h3>
                <SgPreviewCommentCard />
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
            <SgThemePreviewPanel theme="light" />
            <SgThemePreviewPanel theme="dark" />
          </div>
        </SgSection>

        <SgSection
          id="sg-glass"
          label="07 · Liquid Glass"
          title="글래스모피즘 키트"
          description="반투명 레이어, backdrop-blur, 그라데이션 하이라이트를 조합한 실험적 UI 스타일입니다. 본 서비스 기본 톤과는 별도 레퍼런스입니다."
        >
          <SgLiquidGlass />
        </SgSection>
    </div>
  );
}
