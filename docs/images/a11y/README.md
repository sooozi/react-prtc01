# Storybook a11y 스크린샷

이 폴더는 README·PR용 **Accessibility addon** 캡처 이미지를 둡니다.

## 자동 캡처

```bash
nvm use
yarn build-storybook
npx playwright install chromium   # 최초 1회
node scripts/capture-a11y-screenshots.mjs
```

## 수동 캡처

1. `yarn storybook`
2. 스토리 선택 → **Accessibility** 탭
3. Violations가 없거나 의도된 항목만 있는 화면을 저장

## 파일

| 파일 | 스토리 |
|------|--------|
| `storybook-button-a11y.png` | Components / Button / Primary |
| `storybook-confirm-a11y.png` | Components / Confirm / Default |
| `storybook-pagination-a11y.png` | Components / Pagination / MiddlePage |

루트 `README.md` [접근성](../../README.md#접근성-accessibility) 절에서 링크합니다.
