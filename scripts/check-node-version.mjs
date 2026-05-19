/**
 * Storybook 10+ requires Node 20.19+ or 22.12+.
 * Run `nvm use` in the project root (.nvmrc → 20.19.0).
 */
const [major, minor] = process.versions.node.split('.').map(Number);

const ok =
  major > 22 ||
  (major === 22 && minor >= 12) ||
  (major === 20 && minor >= 19);

if (!ok) {
  console.error(
    [
      '',
      'Node.js version is too old for Storybook.',
      `  Current: v${process.versions.node}`,
      '  Required: v20.19+ or v22.12+',
      '',
      'Fix (nvm):',
      '  nvm install 20.19.0',
      '  nvm use',
      '  yarn storybook',
      '',
    ].join('\n'),
  );
  process.exit(1);
}
