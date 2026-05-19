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
    docs: {
      description: {
        component:
          '앱 전역 API 오류 문구를 상단 배너로 표시합니다. `reportApiErrorToUser` / `setGlobalApiErrorText`로 메시지가 설정됩니다.',
      },
      // Docs STORIES: 인라인이면 전역 state가 스토리 간 공유되어 동일한 문구로 보일 수 있음
      story: { inline: false },
    },
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
