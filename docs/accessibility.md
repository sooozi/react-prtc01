# 접근성 (Accessibility)

이 문서는 react-practice 프로젝트의 접근성 관련 도구·구현·검증 방법을 정리합니다.

## 구현 요약

| 영역 | 구현 | 코드 위치 |
|------|------|-----------|
| 페이지 제목 | 라우트마다 `<title>` 갱신 | `src/router/RouteHeadSync.tsx`, `routeDocumentMeta.ts` |
| 라우트 안내 | `aria-live="polite"` 짧은 문구 | `RouteHeadSync` |
| 본문 바로가기 | 스킵 링크 → `#main-content` | `src/components/Layout/Layout.tsx` |
| 랜드마크 | `main`, `header`, `footer` | `Layout`, `Header`, `Footer` |
| 폼·버튼 | `aria-invalid`, `aria-describedby`(힌트·에러 id), `role="alert"`, 라벨 연결 | `Signup`, `Login` 등 |
| 모달 | 포커스 트랩, ESC, `aria-modal` | `Confirm`, `useFloatingLayer` (일정 시트 등) |
| 알림 | `window.alert` 미사용 — 확인은 `Confirm`, API·검증 오류는 `role="alert"` | `Signup`, `Login`, ESLint `no-alert` |
| 툴팁 | `role="tooltip"`, `aria-describedby`, 포커스·터치 | `Tooltip` — hover + focus + 터치(비인터랙티브 영역) |
| 달력 | `aria-label`(이전/다음 달), `role="switch"`·`aria-checked`(주 시작) | `MonthCalendar` |
| 페이지네이션 | `aria-label`로 이동 동작 설명 (`title`은 호버 보조) | `Pagination` `PageMoveButton` |
| 게시판·사용자 목록 | 데스크톱 `tr`·모바일 카드 전체 클릭 → 상세 | `post/list/List`, `user/list/List` |
| 색 대비 (WCAG) | `--color-*` 토큰 조합 AA(4.5:1) 점검 | `src/styles/_color.scss`, `scripts/check-contrast-tokens.mjs` |
| 모션 줄이기 | `prefers-reduced-motion: reduce` 시 애니·전환 완화 | `src/styles/_motion.scss`, `Home.tsx`·`Home.scss` |
| 정적 검사 | JSX a11y 규칙 | `eslint-plugin-jsx-a11y` (`yarn lint`) |
| 런타임 검사 (DEV) | axe 위반 콘솔 로그 | `src/bootstrapAxe.ts` |
| 컴포넌트 검사 | Storybook Accessibility 패널 | `@storybook/addon-a11y` |

## 1. ESLint (`jsx-a11y`)

```bash
yarn lint
```

- `alt` 누락, 잘못된 ARIA, 클릭 가능한 non-button 등을 **코드 작성 단계**에서 경고합니다.
- 설정: `eslint.config.js`

## 2. 개발 서버 — `@axe-core/react`

```bash
yarn dev
```

- **개발 모드에서만** (`main.tsx` → `bootstrapAxe`) 동작합니다.
- 브라우저 개발자 도구 콘솔에 axe 위반 목록이 출력됩니다.
- React 19 환경에서는 로컬 점검 보조용으로만 사용합니다.

## 3. Storybook — Accessibility addon

```bash
yarn storybook
```

1. 브라우저에서 `http://localhost:6006` 접속
2. 왼쪽에서 스토리 선택 (권장: `Components/Button`, `Components/Confirm`, `Components/Pagination`)
3. 하단 또는 addon 바에서 **Accessibility** 탭 클릭
4. Violations / Passes 확인

## 4. 색 대비 (디자인 토큰)

본문·힌트·링크는 배경 대비 **4.5:1 이상**(WCAG AA)을 목표로 `_color.scss` 토큰을 맞춥니다.

```bash
node scripts/check-contrast-tokens.mjs
```

| 토큰 (예) | 용도 | 조정 요약 |
|-----------|------|-----------|
| `--color-text-muted` | 회원가입 힌트 등 | 라이트: 더 진하게, 다크: 더 밝게 |
| `--color-primary` | 링크·강조 | 라이트: 흰 배경에서 4.5:1+ |
| `--color-input-placeholder` | 입력 placeholder | 입력 배경색과 함께 점검 |

수동 확인: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)에 토큰 hex를 넣어 재검증할 수 있습니다.

## 5. 움직임 줄이기 (`prefers-reduced-motion`)

macOS **시스템 설정 → 손쉬운 사용 → 디스플레이 → 움직임 줄이기** 또는 Windows **애니메이션 끄기**를 켜면 브라우저가 `prefers-reduced-motion: reduce`를 보냅니다.

| 구현 | 설명 |
|------|------|
| `src/styles/_motion.scss` | 전역: 애니메이션·`transition`·부드러운 스크롤 완화 |
| `Layout.scss` | 배경 blob 애니 끔 |
| `Home.scss` + `Home.tsx` | 히어로·카드 등장·그라데이션·스크롤 reveal 끔 / 즉시 표시 |
| `reset.scss` | `_motion.scss` 로드 |

확인: 위 OS 설정을 켠 뒤 홈·레이아웃에서 **움직이는 배경·카드 등장**이 없거나 거의 없어야 합니다.

## 6. 수동 키보드 체크 (권장)

| 항목 | 확인 방법 |
|------|-----------|
| 스킵 링크 | Tab → “본문으로 건너뛰기” → Enter → 본문 포커스 |
| 헤더·모바일 메뉴 | Tab / Enter / Esc |
| Confirm | 열기 → Tab 순환 → Esc 닫기 |
| 일정 시트 (좁은 화면) | 일정 입력 → 시트 → Esc 닫기 |
