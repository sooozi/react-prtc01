# React Practice

Vite + React + TypeScript 기반 프론트엔드 연습·포트폴리오 프로젝트입니다.  
로그인·회원가입·사용자 목록·상세(목 데이터)·마이페이지(내가 쓴 글)·게시판(목록·상세·작성·수정·삭제·조회수·검색·정렬·모바일 카드 / 데스크톱 테이블·댓글 UI·이미지 첨부)·일정(월 달력·연·월 선택·주 시작·한국 공휴일 표시·좌측 입력 패널 / 좁은 화면에서는 시트)·다크 모드·접근성(페이지 제목·스킵 링크·라우트 안내 등)을 다룹니다.  

---

## 프로젝트 범위

React + TypeScript + Vite로 인증/게시판/마이페이지/일정 화면을 구현한 개인 프로젝트입니다. 게시판은 CRUD, 검색, 정렬, 페이지네이션, 이미지 첨부·순서 기능까지 포함했고, 목록은 데스크톱 테이블·모바일 카드로 반응형 처리했습니다. Axios로 외부 REST API에 연동하고 401 처리, 토스트, 예외 상황 UX를 정리했습니다. 사용자 목록·상세, 댓글 일부는 mock/데모 데이터로 구성했고 백엔드는 프로젝트 범위에서 제외했습니다.

---

### 데이터·백엔드 경계

| 구분 | 방식 | 비고 |
|------|------|------|
| 로그인·회원가입·게시판·내 글 목록 등 | **실 HTTP** | `VITE_API_BASE_URL` 필요 |
| 사용자 목록·사용자 상세 | **프론트 mock** | `src/mocks/user.ts`, API 없이 목록 형태 학습용 |
| 댓글 영역·무한 스크롤 | **프론트 데모** | 목 데이터·추후 실 API 교체 가능한 구조 |
| 일정 입력 패널 | **UI만** | 저장·서버 동기화 없음 |

### 실험·미연결 코드 (레포 상태)

아래는 현재 기준으로 “파일은 있지만 기본 플로우에서는 사용하지 않는 항목”입니다.

| 항목 | 상태 |
|------|------|
| `pages/schedule/WorkTimeBar.tsx` | **존재하나 현재 `Schedule.tsx`에서 import 되지 않음** (예비·실험 컴포넌트) |
| `backstop.json` | **선택** 시각 회귀용. 로컬에만 두거나, 팀/제출 정책에 따라 커밋. `package.json`에 `backstopjs`가 있어도 `yarn` 스크립트로는 자동 실행하지 않음 |
| SCSS 마이그레이션 스크립트 (`scripts/apply-*.py`) | **제거됨** — 스타일은 수동 토큰(`v.fs` 등) 사용 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **런타임** | Node.js 20.19+ (Vite 7 권장) |
| **빌드/개발** | Vite 7.x |
| **프레임워크** | React 19.x |
| **언어** | TypeScript 5.9.x |
| **라우팅** | React Router DOM 7.x |
| **헤드·타이틀** | react-helmet-async |
| **폼** | React Hook Form 7.x |
| **HTTP** | Axios |
| **스타일** | Sass (SCSS), CSS 변수(테마), 설계 토큰 `v.space` / `v.fs` / `v.fw` / `v.rad` 등 |
| **기타** | clsx · **date-holidays** + `src/lib/` (달력 공휴일) |
| **품질** | ESLint 9 + typescript-eslint + **eslint-plugin-jsx-a11y** · 개발 시 **@axe-core/react** (선택 부트스트랩) |

---

## 환경 요구사항

- **Node.js**: 20.19 이상 권장 (Vite 7). 루트 `.nvmrc`는 `20.19.0`입니다.
- **패키지 매니저**: Yarn (`yarn.lock` 기준)

`nvm` 사용 시 프로젝트 루트에서 `nvm use`로 버전을 맞출 수 있습니다.

---

## 설치 및 실행

```bash
yarn install

# API 연동 시: 루트에 .env 를 만들고
# VITE_API_BASE_URL=<API 서버 베이스 URL>

yarn dev      # http://localhost:5173
yarn build    # tsc -b && vite build
yarn preview
yarn lint     # ESLint (jsx-a11y 포함)
```

---

## 환경 변수 (.env)

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE_URL` | API 베이스 URL. 로그인·회원가입·게시판·내 글 목록 등 axios 연동에 사용. 미설정 시 해당 호출은 실패할 수 있음. **사용자 목록·상세**는 `src/mocks/user.ts`만 사용해 이 변수와 무관함. 저장소에는 올리지 않음. |

---

## 프로젝트 구조

```
src/
├── api/
│   ├── http/          # axios 클라이언트, ApiError, 래퍼
│   ├── auth/          # 로그인, 회원가입, 토큰, 로그인 리다이렉트 세션
│   ├── board/         # 게시판 API·타입
│   └── user/          # 사용자 API 래퍼(목록·상세는 mock)
├── components/
│   ├── PageHeader/    # 페이지 공통 헤더 (Badge + h1 + 선택 subtitle)
│   ├── Badge/, Button/, Confirm/, LoadingState/, Pagination/, Tooltip/
│   ├── Layout/        # Layout, Header, Footer — 스킵 링크, 스크롤 시 헤더
│   ├── ApiErrorBar/   # 상단 API 오류 노출 바
│   ├── TableSortHeader/
│   ├── ImageFileAttachField/   # 작성·수정 통합 첨부(드래그 순서 등)
│   ├── icons/
│   └── index.ts       # 배럴 export (ApiErrorBar 등은 필요 시 파일에서 직접 import)
├── hooks/
│   ├── useFloatingLayer.ts   # Escape, 포커스 트랩, 스크롤 잠금(모달·시트 등)
│   ├── useMediaQuery.ts
│   ├── usePagination.ts
│   └── useUrlQueryPage.ts    # 목록 페이지 URL page 동기화
├── lib/
│   ├── holidayUtils.ts, krHolidays.ts   # 달력 공휴일
├── mocks/
│   └── user.ts
├── pages/
│   ├── Home.tsx, Home.scss
│   ├── about/
│   ├── errors/        # Forbidden, NotFound + _error-page-shared.scss
│   ├── auth/          # login/, signup/, _auth-shared.scss
│   ├── user/          # list/, detail/, my-page/
│   ├── post/          # List, Detail, Write, Update, PostCommentSection, 정렬·쿼리 유틸
│   └── schedule/      # Schedule, MonthCalendar, ScheduleSidePanel, CalendarPickerPopover,
│                      # calendarUtils, WorkTimeBar.tsx(컴포넌트만 존재, 현재 Schedule에 미연결)
├── router/
│   ├── AppRouter.tsx, RequireAuth.tsx
│   ├── RouteHeadSync.tsx      # 문서 제목·스크린 리더 경로 안내(aria-live)
│   └── routeDocumentMeta.ts
├── styles/
│   ├── _color.scss, _variables.scss, _breakpoints.scss, _common-tools.scss, _shadows.scss
│   ├── reset.scss             # main.tsx 에서 로드
│   └── common-global.scss     # main.tsx 에서 로드 — 배경 장식·로고·목록 헤드·에러/빈 상태 등
├── utils/             # tabbable, formatFileSize, arrayMove 등
├── bootstrapAxe.ts    # 개발 전용 axe 콘솔 부트스트랩
├── App.tsx
└── main.tsx           # 테마 선적용 후 reset + common-global + React 마운트
```

- **경로 별칭**: `@` → `src`

---

## 라우팅

| 경로 | 페이지 | 비고 |
|------|--------|------|
| `/` | - | `/home` 리다이렉트 |
| `/home` | Home | 랜딩 |
| `/auth/login`, `/auth/signup` | Login, Signup | |
| `/about` | About | |
| `/forbidden`, `/not-found` | Forbidden, NotFound | |
| `/user/list`, `/user/detail?userId=` | User 목록·상세 | 로그인 불필요, 사용자 데이터는 mock |
| `/user/mypage` | MyPage | 로그인 필수 |
| `/post/list`, `/post/detail?id=`, `/post/write`, `/post/update?id=` | 게시판 | 로그인 필수 · 상세에서 `from` 쿼리로 복귀 경로 처리 |
| `/schedule` | Schedule | 로그인 필수 · UI만(저장 없음) |
| `*` | - | `/not-found` 로 리다이렉트 |

공개 라우트도 **항상 `<Layout>`** 안에서 렌더되어 `<main id="main-content">` 랜드마크가 유지됩니다.  
보호 라우트는 토큰 없을 때 로그인으로 이동하며 리다이렉트 상태·토스트를 넘길 수 있습니다.

**헤더(요약)**: 로고, 테마, 모바일 드로어 메뉴(`ul`/링크)·데스크톱 About · User · Board · Schedule · 로그인/회원가입 또는 프로필·로그아웃.

---

## 주요 기능 요약

- **다크 모드**: `data-theme`, `localStorage.theme`, `_color.scss` 변수.
- **문서 제목·접근성 보조**: `RouteHeadSync` + `routeDocumentMeta` — `<title>` 갱신, 라우트 변경 시 `aria-live="polite"` 짧은 안내.
- **레이아웃**: 본문으로 건너뛰기 링크, `ApiErrorBar`, 스크롤 시 헤더 `inert` 처리 등.
- **페이지 헤더**: `PageHeader`로 화면당 대표 문구와 **단일 `h1`** 패턴 통일 (상세·목록 포함).
- **게시판**: 검색(제목·등록자 ID·이름), 정렬·페이지네이션, 표/카드 반응, 상세 첨부·**댓글 UI(목 데이터·무한 스크롤 데모)**, 이미지 첨부·순서.
- **일정**: `MonthCalendar`(공휴일 이름), 좁은 뷰에서 입력 패널 시트(`useFloatingLayer`).
- **개발 도구**: `import.meta.env.DEV` 에서 `@axe-core/react` 로컬 검사 가능.

상세한 API 필드·엔드포인트 이름은 코드 `src/api/board/boardApi.ts` 등을 참고하면 됩니다.

---

## 공통 컴포넌트 (배럴 기준 발췌)

| 이름 | 역할 |
|------|------|
| **PageHeader** | Badge + `h1` + 선택 subtitle (`list`·`centered`·`auth`·`inline` 변형) |
| **Button** | variant / size, `to`·`href` 지원 |
| **Badge, Confirm, LoadingState, Pagination, Tooltip** | 각 화면에서 공통 패턴 |
| **TableSortTh** 등 | 게시판 목록 정렬 |
| **ImageFileAttachField** | 등록(create)·수정(unified rows) 첨부 |
| **Layout / Header / Footer** | 네비·테마·푸터 |

`ApiErrorBar` 등 일부는 `@/components` 배럴에 없으면 해당 경로에서 직접 import 합니다.

---

## API 및 모의 데이터

- **베이스 URL**: `.env` → `src/api/http/client.ts`.
- **사용자 목록·상세**: `src/mocks/user.ts` 고정 데이터.
- **게시판·인증 등**: 실 HTTP 호출(백엔드 스펙은 코드의 경로·쿼리와 맞춰야 함).
- 로그인 성공 코드 등은 소스 내 상수로만 관리합니다.

---

## 스타일

- **테마 색상**: `src/styles/_color.scss`.
- **토큰·믹스인**: `_variables.scss`, `_common-tools.scss`, `_shadows.scss`, `_breakpoints.scss`.
- **전역**: `reset.scss` 후 `common-global.scss` 로드 (`main.tsx`).
- **페이지·컴포넌트**: 각 `*.scss`에서 `@use "@/styles/..."` 패턴으로 토큰만 써 통일합니다.
- 폰트: Pretendard, Noto Sans KR 및 시스템 폴백 (reset 참고).

---

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `yarn dev` | Vite 개발 서버 |
| `yarn build` | `tsc -b && vite build` |
| `yarn preview` | 프로덕션 빌드 미리보기 |
| `yarn lint` | ESLint |

---

## 기타

- **BackstopJS**: 선택 도구. `backstop.json`이 있으면 `yarn dev` 실행 후 `npx backstop reference` / `npx backstop test` 로 시각 회귀 테스트 가능합니다. 레포마다 파일을 버전에 포함할지(로컬 전용일지)는 본인에게 맡깁니다. `"type": "module"` 과 엔진 `onBefore`/`onReady`의 `require` 혼용 시 충돌할 수 있습니다. 의존성: `package.json`의 `backstopjs`.
- **ESLint**: `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` 포함.
- **React Compiler 관련 규칙**: 일부 훅/라이브러리 조합에서 `react-hooks/` 규칙 경고가 날 수 있음 — 레포 상태에 따라 허용·제외 처리됨.

---

## 라이선스 / 비공개

`private: true` — 개인 연습용 저장소입니다.
