import path from 'node:path';

/** Vite / Vitest / Storybook 공통 `resolve.alias` */
export function resolveAliases(projectRoot: string): Record<string, string> {
  const src = path.join(projectRoot, 'src');
  return {
    '@': src,
    '@pages': path.join(src, 'pages'),
    '@components': path.join(src, 'components'),
    '@api': path.join(src, 'api'),
    '@router': path.join(src, 'router'),
    '@hooks': path.join(src, 'hooks'),
    '@lib': path.join(src, 'lib'),
  };
}
