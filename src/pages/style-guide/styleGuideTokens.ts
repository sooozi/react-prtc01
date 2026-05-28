/** Style Guide 표시용 — 실제 값은 CSS 변수(_color.scss)와 동기 */

export type ColorSchemeTone = "on-color" | "ink";

export type ColorSchemeCell = {
  name: string;
  cssVar: string;
  hex: string;
  tone?: ColorSchemeTone;
  /** 2 = Primary 열처럼 세로 2칸 병합 */
  spanRows?: 2;
  eyebrow?: string;
};

/** 5열×2행 모자이크 — 배치 순서 = DOM 순서 (첫 셀만 spanRows) */
export const COLOR_SCHEME_GRID: ColorSchemeCell[] = [
  {
    name: "Primary",
    cssVar: "--color-primary",
    hex: "#5254d9",
    tone: "on-color",
    spanRows: 2,
    eyebrow: "Colour Scheme",
  },
  { name: "Heading", cssVar: "--color-text-heading", hex: "#0f172a", tone: "on-color" },
  { name: "Muted", cssVar: "--color-text-muted", hex: "#64748b", tone: "on-color" },
  { name: "Border", cssVar: "--color-border", hex: "#e2e8f0", tone: "ink" },
  { name: "Surface", cssVar: "--color-bg-subtle-2", hex: "#f1f5f9", tone: "ink" },
  { name: "Secondary", cssVar: "--color-secondary", hex: "#5b21b6", tone: "on-color" },
  { name: "Primary Hover", cssVar: "--color-primary-hover", hex: "#6366f1", tone: "on-color" },
  { name: "Background", cssVar: "--color-bg-subtle", hex: "#f8fafc", tone: "ink" },
  { name: "Card", cssVar: "--color-bg", hex: "#ffffff", tone: "ink" },
];

export type ColorSemanticGroup = {
  title: string;
  swatches: ColorSchemeCell[];
};

/** Success / Warning / Danger — 각 3단계 (이미지 팔레트와 동기) */
export const COLOR_SEMANTIC_GROUPS: ColorSemanticGroup[] = [
  {
    title: "Success",
    swatches: [
      { name: "100", cssVar: "--color-success-100", hex: "#66DD83", tone: "ink" },
      { name: "500", cssVar: "--color-success-500", hex: "#00C781", tone: "on-color" },
      { name: "600", cssVar: "--color-success-600", hex: "#00B374", tone: "on-color" },
    ],
  },
  {
    title: "Warning",
    swatches: [
      { name: "100", cssVar: "--color-warning-100", hex: "#FFD688", tone: "ink" },
      { name: "500", cssVar: "--color-warning-500", hex: "#FFB838", tone: "on-color" },
      { name: "300", cssVar: "--color-warning-300", hex: "#E6A832", tone: "on-color" },
    ],
  },
  {
    title: "Danger",
    swatches: [
      { name: "100", cssVar: "--color-danger-100", hex: "#FF8C8C", tone: "ink" },
      { name: "500", cssVar: "--color-danger-500", hex: "#FF4040", tone: "on-color" },
      { name: "700", cssVar: "--color-danger-700", hex: "#CC3333", tone: "on-color" },
    ],
  },
];

export const SPACING_SCALE = [
  { key: "xs", rem: "0.25rem", px: 4 },
  { key: "sm", rem: "0.5rem", px: 8 },
  { key: "md", rem: "0.75rem", px: 12 },
  { key: "lg", rem: "1rem", px: 16 },
  { key: "xl", rem: "1.25rem", px: 20 },
  { key: "2xl", rem: "1.5rem", px: 24 },
  { key: "3xl", rem: "2rem", px: 32 },
  { key: "4xl", rem: "2.5rem", px: 40 },
] as const;

export const RADIUS_SCALE = [
  { key: "p8", px: 8, usage: "칩·작은 컨트롤" },
  { key: "p12", px: 12, usage: "버튼·입력" },
  { key: "p16", px: 16, usage: "카드·패널" },
  { key: "p24", px: 24, usage: "히어로·대형 블록" },
] as const;

export const TYPE_SCALE = [
  { label: "Display", sample: "Style Guide", token: "display-md", weight: "bold" },
  { label: "Title", sample: "게시글 상세", token: "2xl", weight: "bold" },
  { label: "Heading", sample: "섹션 제목", token: "lg", weight: "semibold" },
  { label: "Body", sample: "본문과 설명 텍스트는 가독성을 최우선으로 합니다.", token: "base", weight: "regular" },
  { label: "Caption", sample: "조회 128 · 2025.05.28", token: "sm", weight: "medium" },
  { label: "Meta", sample: "보조 정보 · 라벨", token: "xs", weight: "regular" },
] as const;

export const FONT_WEIGHTS = [
  { label: "Regular", weight: 400 },
  { label: "Medium", weight: 500 },
  { label: "Semibold", weight: 600 },
  { label: "Bold", weight: 700 },
] as const;
