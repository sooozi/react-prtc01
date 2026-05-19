import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { ChevronThinIcon } from './ChevronThinIcon';
import { ClockOutlineIcon } from './ClockOutlineIcon';
import { CommentDeleteIcon } from './CommentDeleteIcon';
import { GripHandleIcon } from './GripHandleIcon';
import { SecretCommentLockIcon } from './SecretCommentLockIcon';

const meta = {
  title: 'Components/Icons',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function IconCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {children}
      <p style={{ fontSize: 12, marginTop: 4, marginBottom: 0 }}>{label}</p>
    </div>
  );
}

export const All: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        alignItems: 'center',
        color: 'var(--color-text)',
      }}
    >
      <IconCell label="Chevron up">
        <ChevronThinIcon direction="up" />
      </IconCell>
      <IconCell label="Chevron down">
        <ChevronThinIcon direction="down" />
      </IconCell>
      <IconCell label="Clock">
        <ClockOutlineIcon />
      </IconCell>
      <IconCell label="Grip">
        <GripHandleIcon />
      </IconCell>
      <IconCell label="Delete">
        <CommentDeleteIcon />
      </IconCell>
      <IconCell label="Lock">
        <SecretCommentLockIcon locked />
      </IconCell>
      <IconCell label="Unlock">
        <SecretCommentLockIcon locked={false} />
      </IconCell>
    </div>
  ),
};
