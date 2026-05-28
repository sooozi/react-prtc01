const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const CELL_COUNT = 35;
const TODAY_CELL = 28;

export function SgCalendarPreview() {
  const cells = Array.from({ length: CELL_COUNT }, (_, i) => i + 1);

  return (
    <div className="sg-calendar-preview" aria-label="달력 미리보기">
      <div className="sg-calendar-preview__head">
        <span className="sg-calendar-preview__month">2025년 5월</span>
      </div>
      <div className="sg-calendar-preview__grid">
        {WEEKDAYS.map((d) => (
          <span key={d} className="sg-calendar-preview__dow">
            {d}
          </span>
        ))}
        {cells.map((n) => (
          <span
            key={n}
            className={
              n === TODAY_CELL ? "sg-calendar-preview__day is-today" : "sg-calendar-preview__day"
            }
          >
            {n <= 31 ? n : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
