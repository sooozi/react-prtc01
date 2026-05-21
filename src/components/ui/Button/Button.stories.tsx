import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import Button, { type ButtonVariant } from './Button';

const variants: ButtonVariant[] = [
  'primary',
  'secondary',
  'danger',
  'primaryInverse',
  'secondaryInverse',
  'outlinePrimary',
  'ghost',
];

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: variants,
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: '확인',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: '취소',
    variant: 'secondary',
  },
};

export const Disabled: Story = {
  args: {
    children: '비활성',
    variant: 'primary',
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    children: '작은 버튼',
    variant: 'primary',
    size: 'sm',
  },
};

export const AsLink: Story = {
  args: {
    children: '목록으로',
    to: '/post/list',
    variant: 'ghost',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};
