/** Quill Snow 툴바 버튼·피커에 aria-label 부여 (한국어) */
const TOOLBAR_BUTTON_LABELS: Record<string, string> = {
  bold: "굵게",
  italic: "기울임",
  underline: "밑줄",
  strike: "취소선",
  blockquote: "인용",
  link: "링크 삽입",
  clean: "서식 지우기",
};

const PICKER_LABELS: Record<string, string> = {
  header: "제목 단계 선택",
  color: "글자색 선택",
  background: "배경색 선택",
  align: "정렬 선택",
  list: "목록 종류 선택",
};

export function applyQuillToolbarA11y(editorRoot: HTMLElement): void {
  const toolbar = editorRoot.querySelector(".ql-toolbar");
  if (!toolbar) return;

  for (const [className, label] of Object.entries(TOOLBAR_BUTTON_LABELS)) {
    toolbar.querySelectorAll<HTMLButtonElement>(`button.ql-${className}`).forEach((btn) => {
      if (!btn.getAttribute("aria-label")) {
        btn.setAttribute("aria-label", label);
      }
    });
  }

  for (const [className, label] of Object.entries(PICKER_LABELS)) {
    toolbar.querySelectorAll<HTMLElement>(`.ql-${className} .ql-picker-label`).forEach((el) => {
      if (!el.getAttribute("aria-label")) {
        el.setAttribute("aria-label", label);
      }
    });
  }

  const editor = editorRoot.querySelector<HTMLElement>(".ql-editor");
  if (editor && !editor.getAttribute("role")) {
    editor.setAttribute("role", "textbox");
    editor.setAttribute("aria-multiline", "true");
  }
}
