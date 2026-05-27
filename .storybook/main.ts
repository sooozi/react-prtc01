import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import { resolveAliases } from '../resolveAliases';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

/** GitHub Pages 등 서브경로 배포 시 CI에서 `/react-prtc01/` 형태로 설정 */
const storybookBase = process.env.STORYBOOK_BASE_PATH ?? '/';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',
  async viteFinal(config) {
    return mergeConfig(config, {
      base: storybookBase,
      resolve: {
        alias: resolveAliases(path.resolve(dirname, '..')),
      },
    });
  },
};

export default config;
