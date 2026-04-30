import { useEffect, useMemo, useState } from "react";
import { ChevronThinIcon } from "@/components/icons/ChevronThinIcon";
import { ClockOutlineIcon } from "@/components/icons/ClockOutlineIcon";
import { computeClockOut, normalizeTimeHHmm } from "./workTimeUtils";
import "./WorkTimeBar.scss";

const CLOCK_IN_STORAGE_KEY = "react-practice.schedule.clockIn";
const EXPANDED_STORAGE_KEY = "react-practice.schedule.workTimeBarExpanded";

// 저장된 출근 시간 읽기
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

// 저장된 확장 상태 읽기
function readStoredExpanded(): boolean {
  try {
    const raw = localStorage.getItem(EXPANDED_STORAGE_KEY);
    if (raw === null) return true;
    return raw === "1" || raw === "true";
  } catch {
    return true;
  }
}

// 출퇴근 시각 바
export default function WorkTimeBar() {
  const [clockIn, setClockIn] = useState(() => readStoredClockIn());
  const [expanded, setExpanded] = useState(() => readStoredExpanded());
  const result = useMemo(() => (clockIn ? computeClockOut(clockIn) : null), [clockIn]);

  // 출근 시간 저장
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

  // 확장 상태 저장
  useEffect(() => {
    try {
      localStorage.setItem(EXPANDED_STORAGE_KEY, expanded ? "1" : "0");
    } catch {
      /* private mode / quota */
    }
  }, [expanded]);

  return (
    <div
      className={`work-time-bar${expanded ? "" : " work-time-bar--collapsed"}`}
      role="group"
      aria-labelledby="work-time-bar-title"
    >
      <div className={`work-time-bar__header${expanded ? " work-time-bar__header--with-panel" : ""}`}>
        <h2 className="work-time-bar__title" id="work-time-bar-title">
          출퇴근 시각
        </h2>
        <button
          type="button"
          className="work-time-bar__toggle"
          aria-expanded={expanded}
          aria-controls="work-time-bar-panel"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="work-time-bar__toggle-text">{expanded ? "접기" : "펼치기"}</span>
          <ChevronThinIcon direction={expanded ? "up" : "down"} className="work-time-bar__chevron" />
        </button>
      </div>

      {expanded ? (
        <div id="work-time-bar-panel" className="work-time-bar__panel">
          <div className="work-time-bar__grid" aria-label="출퇴근 시각 입력">
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
              </div>
              <span className="work-time-bar__pill-icon" aria-hidden>
                <ClockOutlineIcon className="work-time-bar__clock-svg" />
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
      ) : (
        <p className="work-time-bar__summary" aria-live="polite" id="work-time-bar-panel">
          {clockIn && result ? (
            <>
              {clockIn} <span className="work-time-bar__summary-arrow">→</span> {result.time}
              {result.nextDay ? <span className="work-time-bar__summary-next">(익일)</span> : null}
            </>
          ) : (
            "시간을 입력하려면 펼치기를 눌러 주세요."
          )}
        </p>
      )}
    </div>
  );
}
