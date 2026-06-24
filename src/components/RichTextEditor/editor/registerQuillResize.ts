/**
 * Quill v2 이미지 리사이즈 모듈 등록 — ReactQuill 인스턴스화 전 1회 실행
 * @see https://github.com/mudoo/quill-resize-module
 */
import { Quill } from "react-quill-new"; // 리사이즈 도구 상자
import QuillResize from "quill-resize-module";
import type { QuillResizeOptions } from "quill-resize-module";
import "quill-resize-module/dist/resize.css";

let registered = false;

export function registerQuillResizeModule(): void {
  if (registered || typeof window === "undefined") return;

  // quill에게 resize라는 이름으로 이 도구를 써
  Quill.register("modules/resize", QuillResize);
  // 한 번만 등록
  registered = true;
}

/** RichTextEditor resize 모듈 옵션 (quillConfig와 타입 공유) */
export type QuillResizeModuleConfig = QuillResizeOptions;

registerQuillResizeModule();
