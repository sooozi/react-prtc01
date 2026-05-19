import { useMemo, useState } from "react";
import { Button } from "@/components";
import "@/pages/schedule/components/side-panel/SidePanel.scss";

const CATEGORY_OPTIONS = [
  { value: "work", label: "업무", theme: "work" as const },
  { value: "meeting", label: "회의", theme: "meeting" as const },
  { value: "personal", label: "개인", theme: "personal" as const },
  { value: "other", label: "기타", theme: "other" as const },
];

type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];

type SidePanelProps = {
  /** 좁은 화면 시트 등 — 닫기 버튼 표시 및 호출 */
  onClose?: () => void;
};

/**
 * 일정 페이지 우측 패널 — 카테고리·날짜·내용 UI만 (저장 등 로직 미연결)
 */
export default function SidePanel({ onClose }: SidePanelProps) {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [category, setCategory] = useState<CategoryValue>("work");
  const [date, setDate] = useState<string>(todayISO);
  const [note, setNote] = useState<string>("");

  const selectedCategoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category;

  function handleSubmit() {
    console.log({
      category,
      categoryLabel: selectedCategoryLabel,
      date,
      note,
    });
  }

  return (
    <aside className="schedule-side-panel" aria-labelledby="schedule-side-panel-title">
      <div className="schedule-side-panel__card">
        <header className="schedule-side-panel__hero">
          <div className="schedule-side-panel__hero-row">
            <h2 id="schedule-side-panel-title" className="schedule-side-panel__title">
              일정 입력
            </h2>
            {onClose ? (
              <button
                type="button"
                className="schedule-side-panel__close"
                onClick={onClose}
                aria-label="일정 입력 닫기"
              >
                <span aria-hidden>×</span>
              </button>
            ) : null}
          </div>
        </header>

        <div className="schedule-side-panel__body">
          <div className="schedule-side-panel__field">
            <div id="schedule-category-label" className="schedule-side-panel__label">
              카테고리
            </div>
            <div className="schedule-side-panel__chip-well">
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
                      checked={category === opt.value}
                      onChange={() => setCategory(opt.value)}
                    />
                    <span className="schedule-side-panel__chip-text">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="schedule-side-panel__field">
            <label htmlFor="schedule-date" className="schedule-side-panel__label">
              날짜
            </label>
            <div className="schedule-side-panel__input-shell">
              <input
                id="schedule-date"
                type="date"
                className="schedule-side-panel__input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="schedule-side-panel__field">
            <label htmlFor="schedule-note" className="schedule-side-panel__label">
              내용
            </label>
            <div className="schedule-side-panel__input-shell schedule-side-panel__input-shell--grow">
              <textarea
                id="schedule-note"
                className="schedule-side-panel__textarea"
                rows={6}
                placeholder="제목 없이 간단히 메모할 수 있어요."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="schedule-side-panel__actions">
            <Button type="button" variant="primary" size="sm" onClick={handleSubmit}>
              등록
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
