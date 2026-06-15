#!/usr/bin/env node
/**
 * 디자인 토큰 전경/배경 조합의 WCAG 대비 비율 점검 (AA 본문 4.5:1, 큰 글 3:1)
 * 실행: node scripts/check-contrast-tokens.mjs
 */

function luminance(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(foreground, background) {
  const l1 = Math.max(luminance(foreground), luminance(background));
  const l2 = Math.min(luminance(foreground), luminance(background));
  return (l1 + 0.05) / (l2 + 0.05);
}

const PAIRS = [
  { name: "light · text on bg", fg: "#1e293b", bg: "#ffffff", min: 4.5 },
  { name: "light · muted on bg", fg: "#64748b", bg: "#ffffff", min: 4.5 },
  { name: "light · primary on bg", fg: "#5254d9", bg: "#ffffff", min: 4.5 },
  { name: "light · tech desc on card", fg: "#64748b", bg: "#ffffff", min: 4.5 },
  { name: "light · placeholder on input", fg: "#576474", bg: "#f2f4f6", min: 4.5 },
  { name: "dark · text on bg", fg: "#f8fafc", bg: "#0f172a", min: 4.5 },
  { name: "dark · muted on bg", fg: "#94a3b8", bg: "#0f172a", min: 4.5 },
  { name: "dark · muted on card", fg: "#94a3b8", bg: "#1e293b", min: 4.5 },
  { name: "dark · primary on bg", fg: "#818cf8", bg: "#0f172a", min: 4.5 },
  { name: "dark · placeholder on input", fg: "#94a3b8", bg: "#1e293b", min: 4.5 },
  { name: "dark · tech desc on card", fg: "#94a3b8", bg: "#1e293b", min: 4.5 },
];

let failed = 0;

console.log("WCAG contrast (AA normal text ≥ 4.5:1)\n");

for (const { name, fg, bg, min } of PAIRS) {
  const ratio = contrastRatio(fg, bg);
  const ok = ratio >= min;
  if (!ok) failed += 1;
  console.log(`${ok ? "✓" : "✗"} ${name}: ${ratio.toFixed(2)}:1 (need ${min}:1)`);
}

if (failed > 0) {
  process.exitCode = 1;
  console.log(`\n${failed} pair(s) below threshold.`);
} else {
  console.log("\nAll checked pairs pass AA for normal text.");
}
