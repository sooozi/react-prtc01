import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";

const meta = {
  title: "Components/RichTextEditor/Editor",
  component: RichTextEditor,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

function EditorDemo({ initial = "", readOnly = false }: { initial?: string; readOnly?: boolean }) {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      <RichTextEditor
        value={value}
        onChange={setValue}
        readOnly={readOnly}
        placeholder="내용을 입력하세요"
      />
    </div>
  );
}

export const Empty: Story = {
  render: () => <EditorDemo />,
};

export const WithContent: Story = {
  render: () => <EditorDemo initial="<p><strong>제목</strong></p><p>본문 내용입니다.</p>" />,
};

export const WithImage: Story = {
  render: () => (
    <EditorDemo initial='<p>이미지를 클릭하면 리사이즈 핸들이 표시됩니다.</p><p><img src="https://picsum.photos/seed/quill-resize/480/320" alt="샘플" /></p>' />
  ),
};

export const ReadOnly: Story = {
  render: () => <EditorDemo readOnly initial="<p>읽기 전용 모드입니다.</p>" />,
};
