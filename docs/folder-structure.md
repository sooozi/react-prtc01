# 폴더 구조·역할 분리 규칙

`react-practice`에서 새 파일을 둘 때 따르는 규칙입니다. 참고 레이아웃인 **react-app** 과 같은 **역할 분리**를 목표로 하되, 이 프로젝트 규모에 맞게 단순하게 유지합니다.

## 한눈에 보기

```
src/
├── pages/          # 화면·라우트 (도메인별)
├── components/     # 여러 페이지에서 쓰는 UI
├── api/            # HTTP·백엔드 호출
├── router/         # 라우트·페이지 제목·인증 가드·Lenis 경로
├── lib/            # 순수 로직·a11y 헬퍼 (React 비의존 우선)
├── schemas/        # 폼·검증 스키마 (zod 등)
├── hooks/          # 여러 화면에서 쓰는 React 훅
├── styles/         # 전역 SCSS·토큰·믹스인
├── utils/          # 범용 유틸 (날짜·문자열 등)
└── mocks/          # 목 데이터·픽스처 (개발·학습용)
```

## 역할별 규칙

| 역할                 | 위치                    | 넣는 것                                                                                      | 넣지 않는 것                             |
| -------------------- | ----------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **화면·라우트**      | `pages/<도메인>/`       | 페이지 컴포넌트, 화면 전용 SCSS                                                              | 여러 도메인에서 쓰는 버튼·Confirm        |
| **화면 전용 조각**   | `pages/.../components/` | 댓글 섹션, 일정 캘린더 등 **그 도메인만** 쓰는 UI                                            | 다른 `pages/*`에서 import (예외는 아래)  |
| **공용 UI**          | `components/`           | Button, Layout, PageHeader, Confirm, RichTextEditor…                                         | 특정 게시글·사용자 화면에만 의미 있는 UI |
| **HTTP·API**         | `api/<도메인>/`         | `createPost`, `login` 등 요청 함수                                                           | JSX, React 훅                            |
| **순수 로직·a11y**   | `lib/`                  | `formDescribedBy`, 쿼리 파싱, 도메인 계산                                                    | API 호출, `.tsx` UI (가능하면)           |
| **폼 스키마**        | `schemas/<도메인>/`     | zod 스키마, resolver용 타입                                                                  | fetch, 컴포넌트                          |
| **라우트·문서 메타** | `router/`               | `AppRouter`, `RequireAuth`, `routeDocumentMeta`, `RouteHeadSync`, `LazyRoute`, `lenisRoutes` | 비즈니스 UI                              |

### 보조 폴더 (위 표에 없어도 고정)

| 폴더      | 용도                                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/`  | `useMediaQuery`, `useUrlQueryPage`, `useFloatingLayer`처럼 **여러 페이지**에서 쓰는 훅. 한 화면·한 컴포넌트만 쓰면 `pages/...` 또는 `components/.../hooks/` 안에 둠 |
| `styles/` | `_color.scss`, `_variables.scss`, `reset.scss` — 페이지 SCSS는 co-locate                                                                                            |
| `utils/`  | 도메인 무관 순수 함수 (`formatFileSize`, `tabbable` 등). 도메인에 묶이면 `lib/<도메인>/`                                                                            |
| `mocks/`  | API 목·픽스처. **MSW는 현재 미설치·미사용**. 프로덕션 번들에 넣지 않음. 실질 사용: `user.ts` (목록·상세). `comment.ts`는 레거시·미연결일 수 있음                    |

## `pages/` 도메인 예시

```
pages/
├── auth/           # login, signup (+ styles/)
├── post/           # list, detail, write, update + components/CommentSection, CommentRow
├── user/           # list, detail, my-page
├── schedule/       # Schedule + components/calendar, side-panel
├── home/           # Home, HomeMarquee
├── about/
├── study-plan/     # /study 학습 가이드
├── style-guide/    # 토큰·컴포넌트 쇼케이스 + components/
├── testmain/       # 랜딩 실험 + TestMainHeroDemo
└── errors/         # forbidden(403), not-found(404)
```

**화면 폴더 관례**

- 한 URL(기능)당 폴더: `list/`, `detail/`, `write/` …
- 같은 화면의 스타일: `List.tsx` + `List.scss` (같은 폴더)
- 도메인 공유 UI: `pages/post/components/` (post 전용만)
- 도메인 공유 SCSS: `pages/auth/styles/`, `pages/post/styles/` 등

**예외:** 랜딩·데모(`testmain`)는 쇼케이스 목적으로 `home/HomeMarquee`, `style-guide/styleGuideTokens` 등 **다른 pages 모듈을 import할 수 있음**. 일반 기능 화면에서는 피한다.

## `api/` 구조

```
api/
├── http/           # axios 인스턴스, 공통 에러·인터셉터, ApiError
├── auth/           # login, signup, token, 로그인 리다이렉트 세션
├── board/          # 게시판·댓글 HTTP
└── user/           # 사용자 (현재 mock 래퍼)
```

- 새 백엔드 영역 → `api/<도메인>/` 파일 추가
- 화면에서는 `@/api/board` 등으로 import (아래 alias 참고)
- `user`는 실 HTTP가 아니라 `mocks/user`를 감싼 형태일 수 있음 → README·코드 주석 확인

## `components/` vs `pages/.../components/`

**공용 (`components/`)** — 2개 이상 도메인에서 import 가능한가?

- 예: `Button`, `PageHeader`, `Confirm`, `RichTextEditor`, `ImageFileAttachField`, `Layout`, `Pagination`, `ApiErrorBar`, Route/Data skeleton

**화면 전용 (`pages/<도메인>/components/`)** — 이름만 봐도 한 기능에 묶이는가?

- 예: `CommentSection`, `MonthCalendar`, `SidePanel`, Style Guide preview 조각

애매하면 먼저 `pages/.../components/`에 두고, 두 번째 도메인에서 필요해질 때 `components/`로 올립니다. 공용으로 올릴 때 Storybook `*.stories.tsx` 추가를 권장합니다.

## `lib/` vs `utils/` vs `schemas/`

|      | `lib/`                                                                     | `utils/`                                  | `schemas/`                    |
| ---- | -------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------- |
| 예   | `formDescribedBy`, `postDetailFromQuery`, `boardListSort`, `scheduleItems` | `formatFileSize`, `tabbable`, `arrayMove` | `loginSchema`, `signupSchema` |
| 특징 | 도메인·a11y 로직 묶음 (`a11y/`, `comment/`, `post/`, `schedule/` …)        | 가장 범용                                 | react-hook-form + zod 전용    |

## `hooks/` (공용)

| 훅                                         | 용도                              |
| ------------------------------------------ | --------------------------------- |
| `useUrlQueryPage`                          | URL `?page=` 동기화               |
| `usePagination`                            | totalItems → totalPages, pageSize |
| `useMediaQuery`                            | `matchMedia` 반응형               |
| `useFloatingLayer` (+ `useBodyScrollLock`) | 시트·Confirm·드로어 포커스/Esc    |
| `useLenisScroll`                           | 일부 랜딩 스무스 스크롤           |

## `router/`

- **경로 정의·lazy·가드**: `AppRouter.tsx`, `RequireAuth.tsx`, `LazyRoute.tsx`
- **`<title>`·메타**: `routeDocumentMeta.ts`, `RouteHeadSync.tsx`
- **Lenis 적용 경로**: `lenisRoutes.ts`
- 새 공개/보호 라우트는 `AppRouter`에 추가하고, 제목 문자열은 `routeDocumentMeta`에 맞춤. 메뉴에 넣을 경우 `Header`에도 `Link` 추가.

## 경로 alias (import)

`@/`는 `src/` 전체, 도메인별 alias는 아래와 같습니다 (`resolveAliases.ts` · `tsconfig.app.json`).

| alias         | 대상             | import 예                                                         |
| ------------- | ---------------- | ----------------------------------------------------------------- |
| `@/`          | `src/`           | `import { Layout, Button } from "@/components"`                   |
| `@/`          | `src/`           | `import { createPost } from "@/api/board"`                        |
| `@/`          | `src/`           | `import RequireAuth from "@/router/RequireAuth"`                  |
| `@/`          | `src/`           | `import { formDescribedBy } from "@/lib/a11y/formDescribedBy"`    |
| `@pages`      | `src/pages`      | (정의됨, **현 코드는 `@/pages/...` 사용이 표준**)                 |
| `@components` | `src/components` | (정의됨, **현 코드는 `@/components` 또는 `@/components/ui/...`**) |
| `@api`        | `src/api`        | (정의됨, **현 코드는 `@/api/...`**)                               |
| `@router`     | `src/router`     | (정의됨, **현 코드는 `@/router/...`**)                            |
| `@hooks`      | `src/hooks`      | (정의됨, **현 코드는 `@/hooks/...`**)                             |
| `@lib`        | `src/lib`        | (정의됨, **현 코드는 `@/lib/...`**)                               |

**실무 표준:** 이 레포는 **`@/` prefix** import가 대부분이다. `@pages`/`@api` 등은 Vite·TS에 등록되어 있으나, 새 코드도 기존과 같이 `@/…`를 쓰면 된다.  
잘못된 예: `@components/Button/Button` (실제는 `components/ui/Button` 또는 배럴 `@/components`).

## 새 기능 체크리스트

1. URL이 생기나? → `pages/<도메인>/<화면>/` + `router/AppRouter.tsx`
2. 로그인 필요? → `RequireAuth` 자식으로 배치
3. 무거운 페이지(에디터·달력 등)? → `lazy` + `LazyRoute`
4. 탭 제목·스크린리더 안내? → `routeDocumentMeta.ts`
5. 헤더 메뉴에 노출? → `components/Layout/Header/Header.tsx`
6. API가 필요한가? → `api/<도메인>/`
7. UI 조각이 한 화면·도메인만 쓰나? → `pages/.../components/`
8. 검증 규칙이 있나? → `schemas/<도메인>/`
9. 재사용 UI인가? → `components/` (+ Storybook `.stories.tsx` 권장)
10. React 없이 테스트 가능한 로직인가? → `lib/` + `*.test.ts`

## 참고: Trombone(react-app)과의 대응

| react-practice    | Trombone (react-app)            |
| ----------------- | ------------------------------- |
| `pages/<domain>/` | `pages/common/`, `workflow/`, … |
| `components/`     | `ui/common/`                    |
| `api/<domain>/`   | `apis/services/...`             |
| `router/`         | `router/TpsRouter`, `*MenuList` |
| `lib/`            | `utils/` + 일부 hooks           |
| `schemas/`        | (페이지·서비스에 분산)          |

버전 폴더(`v1`/`v2`), `store/`, `pms/` 서브패키지는 이 repo 규모에서는 **도입하지 않음**.

## 관련 문서

- [접근성 (accessibility.md)](./accessibility.md)
- [일정 API 요청 명세 (api-request-schedule.md)](./api-request-schedule.md) — localStorage 일정 → HTTP 전환 설계
