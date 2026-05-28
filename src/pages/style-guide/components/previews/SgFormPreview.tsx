import { Button } from "@/components";

export function SgFormPreview() {
  return (
    <div className="sg-form-preview">
      <h3 className="sg-form-preview__title">빠른 문의</h3>
      <label className="sg-field">
        <span className="sg-field__label">이름</span>
        <input type="text" className="input" />
      </label>
      <label className="sg-field">
        <span className="sg-field__label">내용</span>
        <textarea className="input" rows={3} />
      </label>
      <Button variant="primary">제출</Button>
    </div>
  );
}
