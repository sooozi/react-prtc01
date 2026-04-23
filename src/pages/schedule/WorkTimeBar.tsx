import { useEffect, useMemo, useState } from "react";
import { computeClockOut, normalizeTimeHHmm } from "./workTimeUtils";
import "./WorkTimeBar.scss";

const CLOCK_IN_STORAGE_KEY = "react-practice.schedule.clockIn";

function readStoredClockIn(): string {
  try {
    const raw = localStorage.getItem(CLOCK_IN_STORAGE_KEY);
    if (!raw) return "";
    const normalized = normalizeTimeHHmm(raw);
    if (!normalized) {
      localStorage.removeItem(CLOCK_IN_STORAGE_KEY);
      return "";
    }
    return normalized;
  } catch {
    return "";
  }
}

// 시계 아이콘
function ClockIcon() {
  return (
    <svg className="work-time-bar__clock-svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.35" />
      <path d="M12 8.2V12l3 1.9" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

// 출퇴근 시각 바
export default function WorkTimeBar() {
  const [clockIn, setClockIn] = useState(() => readStoredClockIn());
  const result = useMemo(() => (clockIn ? computeClockOut(clockIn) : null), [clockIn]);

  useEffect(() => {
    try {
      if (clockIn) {
        localStorage.setItem(CLOCK_IN_STORAGE_KEY, clockIn);
      } else {
        localStorage.removeItem(CLOCK_IN_STORAGE_KEY);
      }
    } catch {
      /* private mode / quota */
    }
  }, [clockIn]);

  return (
    <div className="work-time-bar" aria-label="출퇴근 시각">
      <div className="work-time-bar__grid">
        <label className="work-time-bar__field-label" htmlFor="schedule-clock-in">
          출근 시간
        </label>
        <span className="work-time-bar__grid-top-spacer" aria-hidden />
        <span className="work-time-bar__field-label" id="work-time-bar-out-heading">
          퇴근 시간
        </span>

        <div className="work-time-bar__pill work-time-bar__pill--in">
          <div className="work-time-bar__time-shell">
            <span className="work-time-bar__time-display" aria-hidden="true">
              {clockIn || "--:--"}
            </span>
            <input
              id="schedule-clock-in"
              type="time"
              value={clockIn}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) {
                  setClockIn("");
                  return;
                }
                const next = normalizeTimeHHmm(v);
                setClockIn(next ?? v);
              }}
              className="work-time-bar__time-input"
              aria-label="출근 시간, 24시 형식"
            />
          </div>
          <span className="work-time-bar__pill-icon" aria-hidden>
            <ClockIcon />
          </span>
        </div>
        <span className="work-time-bar__arrow" aria-hidden>
          →
        </span>
        <output
          className="work-time-bar__pill work-time-bar__pill--out"
          htmlFor="schedule-clock-in"
          aria-labelledby="work-time-bar-out-heading"
          aria-live="polite"
        >
          {result ? (
            <span className="work-time-bar__pill-out-inner">
              <span className="work-time-bar__out-time">{result.time}</span>
              {result.nextDay ? <span className="work-time-bar__next-badge">익일</span> : null}
            </span>
          ) : (
            <span className="work-time-bar__out-placeholder">출근 시간을 등록하세요</span>
          )}
        </output>
      </div>
    </div>
  );
}
