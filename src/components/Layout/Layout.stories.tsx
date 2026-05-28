import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from './Layout';

const meta = {
  title: 'Components/Layout',
  component: Layout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Story />}>
            <Route
              index
              element={
                <div style={{ padding: '2rem' }}>
                  <h2 style={{ marginTop: 0 }}>Outlet content</h2>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                    Layout의 Header / Main / Footer 구조와 고정 헤더 여백을 확인합니다.
                  </p>
                </div>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    ),
  ],
  beforeEach: () => {
    localStorage.setItem('token', 'storybook-demo-token');
    localStorage.setItem('userName', '스토리북 사용자');
    localStorage.setItem('userId', '1');
  },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {};

export const Guest: Story = {
  beforeEach: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
  },
};

