import type { Meta, StoryObj } from '@storybook/react-vite';
import Tooltip from './Tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    content: { control: 'text' },
    disabled: { control: 'boolean' },
    onlyWhenTruncated: { control: 'boolean' },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: '마우스를 올리거나, 버튼에 포커스하면 툴팁이 표시됩니다.',
    children: <button type="button">호버 · Tab 포커스</button>,
  },
};

export const KeyboardFocus: Story = {
  args: {
    content: '키보드 포커스 시에도 동일한 설명이 연결됩니다.',
    children: <button type="button">Tab으로 포커스</button>,
  },
};

export const TruncatedText: Story = {
  args: {
    content: '긴 제목 전체 텍스트입니다.',
    onlyWhenTruncated: true,
    children: (
      <span
        style={{
          display: 'inline-block',
          maxWidth: 120,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          verticalAlign: 'bottom',
        }}
      >
        긴 제목 전체 텍스트입니다.
      </span>
    ),
  },
};

export const Disabled: Story = {
  args: {
    content: '표시되지 않음',
    disabled: true,
    children: <span>툴팁 비활성</span>,
  },
};
