import { useState } from "react";
import "@/pages/style-guide/components/SgLiquidGlass.scss";

const NAV_ITEMS = ["Toast", "Tabs"] as const;

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5 9.5 16.5 19 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SgLiquidGlass() {
  const [activeNav, setActiveNav] = useState<(typeof NAV_ITEMS)[number]>("Toast");
  const [notifyOn, setNotifyOn] = useState(true);

  return (
    <div className="sg-glass-stage" aria-label="Liquid Glass UI 키트 미리보기">
      <div className="sg-glass-stage__glow" aria-hidden />

      <div className="sg-glass-kit">
        <div className="sg-glass-kit__blobs" aria-hidden />
        <div className="sg-glass-kit__sheen" aria-hidden />
        <div className="sg-glass-kit__edge" aria-hidden />

        <header className="sg-glass-kit__head">
          <div className="sg-glass-kit__brand">
            <span className="sg-glass-kit__wave" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </span>
            <h3 className="sg-glass-kit__title">Liquid Glass Kit</h3>
          </div>
          <button type="button" className="sg-glass-icon-btn" aria-label="검색">
            <SearchIcon />
          </button>
        </header>

        <label className="sg-glass-field sg-glass-field--solid">
          <span className="visually-hidden">Create workspace</span>
          <input type="text" placeholder="Create workspace" />
          <span className="sg-glass-field__trail">
            <SearchIcon />
          </span>
        </label>

        <div className="sg-glass-kit__actions" role="group" aria-label="액션 버튼">
          <button type="button" className="sg-glass-btn sg-glass-btn--plus" aria-label="추가">
            +
          </button>
          <button type="button" className="sg-glass-btn sg-glass-btn--glass" aria-label="글래스 액션" />
          <button type="button" className="sg-glass-btn sg-glass-btn--violet">
            Button
          </button>
          <button type="button" className="sg-glass-btn sg-glass-btn--teal">
            Button
          </button>
        </div>

        <article className="sg-glass-panel">
          <span className="sg-glass-panel__check" aria-hidden>
            <CheckIcon />
          </span>
          <span className="sg-glass-panel__label">Workspace</span>
        </article>

        <div className="sg-glass-search-stack">
          <div className="sg-glass-search sg-glass-search--frosted">
            <span className="sg-glass-search__text">Search projects…</span>
            <button type="button" className="sg-glass-search__fab" aria-label="프로젝트 추가">
              +
            </button>
          </div>
          <div className="sg-glass-search sg-glass-search--minimal">
            <span className="sg-glass-search__text sg-glass-search__text--muted">Search</span>
            <span className="sg-glass-search__check" aria-hidden>
              <CheckIcon />
            </span>
          </div>
        </div>

        <div className="sg-glass-kit__footer">
          <div className="sg-glass-nav" role="tablist" aria-label="내비게이션">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={activeNav === item}
                className={activeNav === item ? "sg-glass-nav__item is-active" : "sg-glass-nav__item"}
                onClick={() => setActiveNav(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="sg-glass-toggle">
            <span className="visually-hidden">알림</span>
            <input
              type="checkbox"
              checked={notifyOn}
              onChange={(e) => setNotifyOn(e.target.checked)}
            />
            <span className="sg-glass-toggle__track" aria-hidden />
          </label>

          <span className="sg-glass-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M14 11a5 5 0 0 0-7.07 0L5.52 12.41a5 5 0 0 0 7.07 7.07L14 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            files
          </span>
        </div>

        <article className="sg-glass-promo">
          <div className="sg-glass-promo__copy">
            <h4 className="sg-glass-promo__title">Invite member</h4>
            <p className="sg-glass-promo__desc">Upgrade plan</p>
          </div>
          <button type="button" className="sg-glass-promo__cta">
            <span aria-hidden>+</span> Upgrade plan
          </button>
        </article>
      </div>
    </div>
  );
}
