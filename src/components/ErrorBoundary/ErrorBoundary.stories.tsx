import type { Meta, StoryObj } from '@storybook/react-vite';
import ErrorBoundary from './ErrorBoundary';

function Boom() {
  throw new Error('Storybook test error');
}

const meta = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    children: <div style={{ padding: 16 }}>정상 렌더링</div>,
  },
};

export const CatchesError: Story = {
  args: {
    children: <Boom />,
  },
};

