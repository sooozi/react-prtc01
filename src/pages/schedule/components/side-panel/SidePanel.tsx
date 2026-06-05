import { useMemo, useState } from "react";
import { Button } from "@/components";
import "@/pages/schedule/components/side-panel/SidePanel.scss";

const STORAGE_KEY = "scheduleItems";

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

type ScheduleDraftItem = {
  id: string;
  category: CategoryValue;
  categoryLabel: string;
  date: string;
  note: string;
  createdAt: number;
};

// 로컬스토리지에서 일정 데이터를 읽어오는 함수(새 일정은 배열 맨 앞에 추가)
function safeReadScheduleItems(): ScheduleDraftItem[] {
  const raw = localStorage.getItem(STORAGE_KEY); // 로컬스토리지에서 일정 데이터를 읽어옴
  if (!raw) return []; // 일정 데이터가 없으면 빈 배열 반환
  try {
    const parsed = JSON.parse(raw) as unknown; // 파싱 결과를 ScheduleDraftItem[] 타입으로 형변환
    return Array.isArray(parsed) ? (parsed as ScheduleDraftItem[]) : []; // 파싱 결과가 배열이면 배열 반환, 아니면 빈 배열 반환
  } catch { // 파싱 결과가 배열이 아니면 빈 배열 반환
    return [];
  }
}

/**
 * 일정 페이지 우측 패널 — 카테고리·날짜·내용 UI
 */
export default function SidePanel({ onClose }: SidePanelProps) {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [category, setCategory] = useState<CategoryValue>("work");
  const [date, setDate] = useState<string>(todayISO);
  const [note, setNote] = useState<string>("");

  // 선택된 카테고리 라벨
  const selectedCategoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category;

  // 일정 입력 저장 함수
  function handleSubmit() {
    // 일정 입력 저장(일정 1개를 객체로 만듦)
    const item: ScheduleDraftItem = {
      id: crypto.randomUUID(),
      category,
      categoryLabel: selectedCategoryLabel,
      date,
      note,
      createdAt: Date.now(),
    };

    const prev = safeReadScheduleItems(); // 로컬스토리지에서 일정 데이터를 읽어옴
    const next = [item, ...prev]; // 일정 데이터를 추가
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); // 일정 데이터를 로컬스토리지에 저장
    window.dispatchEvent(new Event("schedule-items-updated"));  // 일정 데이터가 업데이트되었음을 알림

    // console.log("[일정 입력] 로컬스토리지 저장됨", { saved: item, total: next.length });

    setNote(""); // 내용 초기화
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
                    {/* 카테고리 선택 */}
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
            {/* 날짜 선택 */}
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
            {/* 내용 입력 */}
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
            {/* 등록 버튼 */}
            <Button type="button" variant="primary" size="sm" onClick={handleSubmit}>
              등록
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
