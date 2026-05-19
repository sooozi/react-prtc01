import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import ApiErrorBar from './ApiErrorBar';
import {
  clearGlobalApiError,
  setGlobalApiErrorText,
} from '@/api/http/apiErrorDisplay';

function WithGlobalApiError({
  message,
  children,
}: {
  message: string;
  children: ReactNode;
}) {
  useEffect(() => {
    setGlobalApiErrorText(message);
    return () => clearGlobalApiError();
  }, [message]);

  return <>{children}</>;
}

const meta = {
  title: 'Components/ApiErrorBar',
  component: ApiErrorBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  beforeEach: () => {
    clearGlobalApiError();
  },
} satisfies Meta<typeof ApiErrorBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = {};

export const WithMessage: Story = {
  decorators: [
    (Story) => (
      <WithGlobalApiError message="게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.">
        <Story />
      </WithGlobalApiError>
    ),
  ],
};

export const LongMessage: Story = {
  decorators: [
    (Story) => (
      <WithGlobalApiError message="네트워크에 연결할 수 없습니다. 연결을 확인한 뒤 다시 시도해주세요. 문제가 계속되면 관리자에게 문의하세요.">
        <Story />
      </WithGlobalApiError>
    ),
  ],
};
