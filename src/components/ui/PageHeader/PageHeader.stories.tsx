import type { Meta, StoryObj } from '@storybook/react-vite';
import PageHeader from './PageHeader';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['list', 'centered', 'auth', 'inline'],
      description: '타이포는 동일. 제목 아래 margin-bottom만 다름',
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  args: {
    badge: '게시판',
    title: '게시글 목록',
    subtitle: '검색·정렬·페이지 이동을 지원합니다.',
    variant: 'list',
  },
};

export const Centered: Story = {
  args: {
    badge: '소개',
    title: 'About',
    subtitle: '프로젝트 개요',
    variant: 'centered',
  },
};

export const Auth: Story = {
  args: {
    badge: '계정',
    title: '로그인',
    variant: 'auth',
  },
};

export const Inline: Story = {
  args: {
    badge: '설정',
    title: '시스템 설정',
    variant: 'inline',
  },
};
