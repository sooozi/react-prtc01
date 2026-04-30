import "@/pages/schedule/ScheduleSidePanel.scss";

const CATEGORY_OPTIONS = [
  { value: "work", label: "업무", theme: "work" as const },
  { value: "meeting", label: "회의", theme: "meeting" as const },
  { value: "personal", label: "개인", theme: "personal" as const },
  { value: "other", label: "기타", theme: "other" as const },
];

/**
 * 일정 페이지 우측 패널 — 카테고리·날짜·내용 UI만 (저장 등 로직 미연결)
 */
export default function ScheduleSidePanel() {
  return (
    <aside className="schedule-side-panel" aria-labelledby="schedule-side-panel-title">
      <div className="schedule-side-panel__card">
        <h2 id="schedule-side-panel-title" className="schedule-side-panel__title">
          일정 입력
        </h2>

        <div className="schedule-side-panel__field">
          <div id="schedule-category-label" className="schedule-side-panel__label">
            카테고리
          </div>
          <div
            className="schedule-side-panel__chips"
            role="radiogroup"
            aria-labelledby="schedule-category-label"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`schedule-side-panel__chip schedule-side-panel__chip--${opt.theme}`}
              >
                <input
                  type="radio"
                  name="schedule-category"
                  value={opt.value}
                  className="schedule-side-panel__chip-input"
                  defaultChecked={opt.value === "work"}
                />
                <span className="schedule-side-panel__chip-text">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="schedule-side-panel__field">
          <label htmlFor="schedule-date" className="schedule-side-panel__label">
            날짜
          </label>
          <input id="schedule-date" type="date" className="schedule-side-panel__input" />
        </div>

        <div className="schedule-side-panel__field">
          <label htmlFor="schedule-note" className="schedule-side-panel__label">
            내용
          </label>
          <textarea
            id="schedule-note"
            className="schedule-side-panel__textarea"
            rows={6}
            placeholder="일정 내용을 입력하세요."
          />
        </div>
      </div>
    </aside>
  );
}
