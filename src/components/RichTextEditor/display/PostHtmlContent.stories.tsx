import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostHtmlContent } from './PostHtmlContent';

const meta = {
  title: 'Components/RichTextEditor/Display',
  component: PostHtmlContent,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    html: { control: 'text' },
    emptyLabel: { control: 'text' },
  },
} satisfies Meta<typeof PostHtmlContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHtml: Story = {
  args: {
    html: '<p><strong>게시글 제목</strong></p><p>Quill에서 저장된 <em>HTML</em> 본문 예시입니다.</p><ul><li>목록 1</li><li>목록 2</li></ul>',
  },
};

export const Empty: Story = {
  args: {
    html: '',
    emptyLabel: '내용 없음',
  },
};

export const PlainTextLegacy: Story = {
  args: {
    html: '예전 plain text 본문도 표시됩니다.',
  },
};
