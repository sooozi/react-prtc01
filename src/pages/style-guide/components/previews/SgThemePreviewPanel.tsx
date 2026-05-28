import { Button } from "@/components";

export type SgThemePreviewPanelProps = {
  theme: "light" | "dark";
};

export function SgThemePreviewPanel({ theme }: SgThemePreviewPanelProps) {
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
