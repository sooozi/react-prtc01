/** Tab 순서에 포함될 수 있는 요소만 모은다(모달·드로어 포커스 트랩용). */
const TABBABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isDisplayedFocusable(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const pos = style.position;
  if (el.offsetParent !== null || pos === "fixed" || pos === "sticky") return true;
  return false;
}

export function getTabbableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(isDisplayedFocusable);
}
