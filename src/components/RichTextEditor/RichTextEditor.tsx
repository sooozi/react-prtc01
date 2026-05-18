/**
 * 게시글 본문용 리치 텍스트 에디터 (react-quill-new 래퍼, React 19 호환)
 * Write / Update에서 textarea 대신 사용하며, value·onChange는 HTML 문자열 기준
 */
import ReactQuill from "react-quill-new";
import { quillFormats, quillModules } from "./quillConfig";
import "./RichTextEditor.scss";

export type RichTextEditorProps = {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
};

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "내용을 입력하세요",
  readOnly = false,
  className = "",
}: RichTextEditorProps) {
  return (
    <div className={["rich-text-editor", className].filter(Boolean).join(" ")}>
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
