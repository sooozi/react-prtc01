import { defineConfig } from 'vitest/config';
import { resolveAliases } from './resolveAliases';

/** 앱 단위·로직 테스트 (Storybook 브라우저 테스트와 분리) */
export default defineConfig({
  resolve: {
    alias: resolveAliases(__dirname),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
