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
      test: 'todo',
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
