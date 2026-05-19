import React from 'react';
import type { Preview } from '@storybook/react-vite';
import '@/styles/reset.scss';
import '@/styles/common-global.scss';
import 'quill/dist/quill.snow.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color|theme)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      /** Storybook UI·Tests 탭에서 위반 표시 (빌드 실패는 하지 않음) */
      test: 'todo',
      config: {
        rules: {
          /** Storybook centered 레이아웃에서 region 누락은 스토리 단위 한계 — 앱 Layout에서 보완 */
          region: { enabled: false },
        },
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },
  },
  decorators: [
    (Story) => {
      const theme =
        localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      return <Story />;
    },
  ],
};

export default preview;
