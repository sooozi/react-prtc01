import type { Meta, StoryObj } from '@storybook/react-vite';
import LoadingState from './LoadingState';

const meta = {
  title: 'Components/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    message: { control: 'text' },
    variant: { control: 'select', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: '데이터를 불러오는 중...',
    variant: 'default',
  },
};

export const Compact: Story = {
  args: {
    message: '불러오는 중...',
    variant: 'compact',
  },
};