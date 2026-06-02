import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  COLOR_SCHEME_GRID,
  COLOR_SEMANTIC_GROUPS,
  type ColorSchemeCell,
} from "@/pages/style-guide/styleGuideTokens";

type SgColorSchemeCellProps = {
  cell: ColorSchemeCell;
  labelPrefix?: string;
  onCopy: (cell: ColorSchemeCell, labelPrefix?: string) => void;
};

function SgColorSchemeCell({ cell, labelPrefix, onCopy }: SgColorSchemeCellProps) {
  const tone = cell.tone ?? "on-color";
  const displayName = labelPrefix ? `${labelPrefix} ${cell.name}` : cell.name;

  return (
    <button
      type="button"
      className={clsx(
        "sg-color-scheme__cell",
        cell.spanRows === 2 && "sg-color-scheme__cell--span-rows",
        tone === "ink" && "sg-color-scheme__cell--ink"
      )}
      style={{ backgroundColor: `var(${cell.cssVar})` }}
      onClick={() => onCopy(cell, labelPrefix)}
      aria-label={`${displayName} ${cell.hex} 색상 코드 복사`}
    >
      {cell.eyebrow ? <span className="sg-color-scheme__eyebrow">{cell.eyebrow}</span> : null}
      <span className="sg-color-scheme__label">{cell.name}</span>
      <span className="sg-color-scheme__hex">{cell.hex}</span>
    </button>
  );
}

export function SgColorSchemeBoard() {
  const [copyToast, setCopyToast] = useState<string | null>(null);

  useEffect(() => {
    if (!copyToast) return;
    const timer = window.setTimeout(() => setCopyToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [copyToast]);

  const handleCopy = useCallback(async (cell: ColorSchemeCell, labelPrefix?: string) => {
    const displayName = labelPrefix ? `${labelPrefix} ${cell.name}` : cell.name;
    const value = cell.hex.toUpperCase();

    try {
      await navigator.clipboard.writeText(value);
      setCopyToast(`${displayName} (${value}) 복사됨`);
    } catch {
      setCopyToast("복사에 실패했습니다. 다시 시도해 주세요.");
    }
  }, []);

  return (
    <div className="sg-color-system">
      <div className="sg-color-scheme" role="img" aria-label="프로젝트 컬러 스킴">
        {COLOR_SCHEME_GRID.map((cell) => (
          <SgColorSchemeCell key={cell.cssVar} cell={cell} onCopy={handleCopy} />
        ))}
      </div>
      <div className="sg-color-semantic-board" aria-label="시맨틱 컬러">
        {COLOR_SEMANTIC_GROUPS.map((group) => (
          <div key={group.title} className="sg-color-semantic-group">
            <p className="sg-color-semantic-group__title">{group.title} Colors</p>
            <div className="sg-color-semantic-group__strip">
              {group.swatches.map((cell) => (
                <SgColorSchemeCell
                  key={cell.cssVar}
                  cell={cell}
                  labelPrefix={group.title}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {copyToast
        ? createPortal(
            <div className="sg-color-copy-toast" role="status" aria-live="polite">
              <div className="sg-toast">
                <span className="sg-toast__icon" aria-hidden>
                  ✓
                </span>
                <span className="sg-toast__text">{copyToast}</span>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
