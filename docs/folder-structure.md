# 폴더 구조·역할 분리 규칙

`react-practice`에서 새 파일을 둘 때 따르는 규칙입니다. 회사 `react-app`(Trombone)과 같은 **역할 분리**를 목표로 하되, 이 프로젝트 규모에 맞게 단순하게 유지합니다.

## 한눈에 보기

```
src/
├── pages/          # 화면·라우트 (도메인별)
├── components/     # 여러 페이지에서 쓰는 UI
├── api/            # HTTP·백엔드 호출
├── router/         # 라우트·페이지 제목·인증 가드
├── lib/            # 순수 로직·a11y 헬퍼 (React 비의존 우선)
├── schemas/        # 폼·검증 스키마 (zod 등)
├── hooks/          # 여러 화면에서 쓰는 React 훅
├── styles/         # 전역 SCSS·토큰·믹스인
├── utils/          # 범용 유틸 (날짜·문자열 등)
└── mocks/          # 목 데이터·MSW 등 (개발·스토리용)
```

## 역할별 규칙

| 역할 | 위치 | 넣는 것 | 넣지 않는 것 |
|------|------|---------|--------------|
| **화면·라우트** | `pages/<도메인>/` | 페이지 컴포넌트, 화면 전용 SCSS | 여러 도메인에서 쓰는 버튼·모달 |
| **화면 전용 조각** | `pages/.../components/` | 댓글 섹션, 일정 캘린더 등 **그 도메인만** 쓰는 UI | 다른 `pages/*`에서 import |
| **공용 UI** | `components/` | Button, Layout, Pagination, Confirm… | 특정 게시글·사용자 화면에만 의미 있는 UI |
| **HTTP·API** | `api/<도메인>/` | `createPost`, `login` 등 요청 함수 | JSX, React 훅 |
| **순수 로직·a11y** | `lib/` | `formDescribedBy`, 쿼리 파싱, 도메인 계산 | API 호출, `.tsx` UI (가능하면) |
| **폼 스키마** | `schemas/<도메인>/` | zod 스키마, resolver용 타입 | fetch, 컴포넌트 |
| **라우트·문서 메타** | `router/` | `AppRouter`, `RequireAuth`, `routeDocumentMeta`, `RouteHeadSync` | 비즈니스 UI |

### 보조 폴더 (위 표에 없어도 고정)

| 폴더 | 용도 |
|------|------|
| `hooks/` | `useMediaQuery`처럼 **여러 페이지**에서 쓰는 훅. 한 화면만 쓰면 `pages/...` 안에 둠 |
| `styles/` | `_color.scss`, `_variables.scss`, `reset.scss` — 페이지 SCSS는 co-locate |
| `utils/` | 도메인 무관 순수 함수. 도메인에 묶이면 `lib/<도메인>/`도 가능 |
| `mocks/` | API 목·픽스처. 프로덕션 번들에 넣지 않음 |

## `pages/` 도메인 예시

```
pages/
├── auth/           # login, signup
├── post/           # list, detail, write, update + components/CommentSection
├── user/           # list, detail, my-page
├── schedule/       # Schedule + components/calendar, side-panel
├── home/, about/
└── errors/         # 403, 404
```

**화면 폴더 관례**

- 한 URL(기능)당 폴더: `list/`, `detail/`, `write/` …
- 같은 화면의 스타일: `List.tsx` + `List.scss` (같은 폴더)
- 도메인 공유 UI: `pages/post/components/` (post 전용만)

## `api/` 구조

```
api/
├── http/           # axios 인스턴스, 공통 에러·인터셉터
├── auth/
├── board/
└── user/
```

- 새 백엔드 영역 → `api/<도메인>/` 파일 추가
- 화면에서는 `@api/board` 등으로 import (아래 alias 참고)

## `components/` vs `pages/.../components/`

**공용 (`components/`)** — 2개 이상 도메인에서 import 가능한가?

- 예: `Button`, `PageHeader`, `RichTextEditor`, `Layout`

**화면 전용 (`pages/<도메인>/components/`)** — 이름만 봐도 한 기능에 묶이는가?

- 예: `CommentSection`, `MonthCalendar`, `SidePanel`

애매하면 먼저 `pages/.../components/`에 두고, 두 번째 도메인에서 필요해질 때 `components/`로 올립니다.

## `lib/` vs `utils/` vs `schemas/`

| | `lib/` | `utils/` | `schemas/` |
|--|--------|----------|------------|
| 예 | `formDescribedBy`, `postDetailFromQuery` | 포맷·파싱 헬퍼 | `signupSchema` |
| 특징 | 도메인·a11y 로직 묶음 가능 | 가장 범용 | react-hook-form + zod 전용 |

## `router/`

- **경로 정의·lazy·가드**: `AppRouter.tsx`, `RequireAuth.tsx`, `LazyRoute.tsx`
- **`<title>`·메타**: `routeDocumentMeta.ts`, `RouteHeadSync.tsx`
- 새 공개/보호 라우트는 `AppRouter`에 추가하고, 제목 문자열은 `routeDocumentMeta`에 맞춤

## 경로 alias (import)

`@/`는 `src/` 전체, 도메인별 alias는 아래와 같습니다 (`resolveAliases.ts` · `tsconfig.app.json`).

| alias | 대상 | import 예 |
|-------|------|-----------|
| `@/` | `src/` | `import { Layout } from "@/components"` |
| `@pages` | `src/pages` | `import List from "@pages/post/list/List"` |
| `@components` | `src/components` | `import { Button } from "@components/Button/Button"` |
| `@api` | `src/api` | `import { createPost } from "@api/board"` |
| `@router` | `src/router` | `import RequireAuth from "@router/RequireAuth"` |
| `@hooks` | `src/hooks` | (필요 시) |
| `@lib` | `src/lib` | `import { formDescribedBy } from "@lib/a11y/formDescribedBy"` |

기존 `@/pages/...` import도 유효합니다. **새·수정 코드**는 위 alias를 우선 사용합니다.

## 새 기능 체크리스트

1. URL이 생기나? → `pages/<도메인>/<화면>/` + `router/AppRouter.tsx`
2. API가 필요한가? → `api/<도메인>/`
3. UI 조각이 한 화면만 쓰나? → `pages/.../components/`
4. 검증 규칙이 있나? → `schemas/<도메인>/`
5. 재사용 UI인가? → `components/` (+ Storybook `.stories.tsx` 권장)
6. React 없이 테스트 가능한 로직인가? → `lib/` + `*.test.ts`

## react-app과의 대응

| react-practice | react-app (Trombone) |
|----------------|----------------------|
| `pages/<domain>/` | `pages/common/`, `workflow/`, … |
| `components/` | `ui/common/` |
| `api/<domain>/` | `apis/services/...` |
| `router/` | `router/TpsRouter`, `*MenuList` |
| `lib/` | `utils/` + 일부 hooks |
| `schemas/` | (페이지·서비스에 분산) |

버전 폴더(`v1`/`v2`), `store/`, `pms/` 서브패키지는 이 repo 규모에서는 **도입하지 않음**.

## 관련 문서

- [접근성 (accessibility.md)](./accessibility.md)
