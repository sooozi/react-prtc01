import type { QuillResizeModuleConfig } from "./registerQuillResize";

/** 이미지 클릭 시 크기 표시 + 모서리 핸들 드래그 리사이즈 */
export const quillResizeModuleConfig: QuillResizeModuleConfig = {
  modules: ["DisplaySize", "Resize"],
  embedTags: [],
  parchment: {
    image: {
      attribute: ["width"],
      limit: { minWidth: 80 },
    },
  },
};

/** Quill 툴바·동작 설정 — RichTextEditor에서 modules prop으로 전달 */
export const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["image"], // 이미지 삽입 버튼
    ["blockquote"], // 인용 블록
    ["link"],
    ["clean"],
  ],
  resize: quillResizeModuleConfig, // 리사이즈 모듈 설정
};

/** 저장·편집에 허용할 HTML 포맷 목록 — toolbar와 맞춰 제한 */
export const quillFormats = [
  "header",

  "bold",
  "italic",
  "underline",
  "strike",

  "color",
  "background",

  "image",

  "align",

  "list",

  "blockquote",

  "link",
];
