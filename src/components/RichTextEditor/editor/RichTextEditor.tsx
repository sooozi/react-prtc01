/**
 * 게시글 본문용 리치 텍스트 에디터 (react-quill-new 래퍼, React 19 호환)
 * Write / Update에서 textarea 대신 사용하며, value·onChange는 HTML 문자열 기준
 */
import { useLayoutEffect, useRef } from "react";
import ReactQuill from "react-quill-new";
import { quillFormats, quillModules } from "./quillConfig";
import { applyQuillToolbarA11y } from "./quillToolbarA11y";
import "./RichTextEditor.scss";

export type RichTextEditorProps = {
  id?: string;
  /** 외부 <label id="..."> 와 연결 */
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
};

export function RichTextEditor({
  id,
  labelledBy,
  describedBy,
  invalid = false,
  value,
  onChange,
  placeholder = "내용을 입력하세요",
  readOnly = false,
  className = "",
}: RichTextEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const enhance = () => applyQuillToolbarA11y(root);
    enhance();
    const frame = requestAnimationFrame(enhance);

    const editor = root.querySelector<HTMLElement>(".ql-editor");
    if (editor) {
      if (labelledBy) {
        editor.setAttribute("aria-labelledby", labelledBy);
      }
      if (describedBy) {
        editor.setAttribute("aria-describedby", describedBy);
      } else {
        editor.removeAttribute("aria-describedby");
      }
      if (invalid) {
        editor.setAttribute("aria-invalid", "true");
      } else {
        editor.removeAttribute("aria-invalid");
      }
    }

    return () => cancelAnimationFrame(frame);
  }, [labelledBy, describedBy, invalid, readOnly]);

  return (
    <div
      ref={rootRef}
      className={["rich-text-editor", invalid && "rich-text-editor--invalid", className]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={invalid || undefined}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      <ReactQuill
        id={id}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}
