/** Quill 툴바·동작 설정 — RichTextEditor에서 modules prop으로 전달 */
export const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["image"],
    ["blockquote"], // 인용 블록
    ["link"],
    ["clean"],
  ],
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