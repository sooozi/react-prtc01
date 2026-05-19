import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Confirm from './Confirm';

const meta = {
  title: 'Components/Confirm',
  component: Confirm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    open: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
  argTypes: {
    open: { control: 'boolean' },
    variant: { control: 'select', options: ['default', 'danger'] },
    message: { control: 'text' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof Confirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: '저장하지 않고 나가시겠습니까?',
    title: '확인',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    title: '삭제',
    message: '이 게시글을 삭제할까요? 되돌릴 수 없습니다.',
    confirmLabel: '삭제',
  },
};

export const MessageOnly: Story = {
  args: {
    message: '요청을 처리했습니다.',
    title: undefined,
  },
};
