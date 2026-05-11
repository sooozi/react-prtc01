# React Practice

Vite + React + TypeScript 기반의 프론트엔드 연습·포트폴리오용 프로젝트입니다.  
로그인·회원가입·사용자 목록·사용자 상세(목 데이터)·마이페이지(내가 쓴 글)·게시판(목록/상세/글쓰기/수정/삭제·댓글·첨부)·**일정(월 달력·사이드 패널 UI)**, 다크 모드, 공통 컴포넌트를 다룹니다.  
레이아웃은 스크롤 방향에 따라 헤더를 숨겼다 보였다 합니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **런타임** | Node.js 20.19+ (Vite 7 권장) |
| **빌드/개발** | Vite 7.x |
| **프레임워크** | React 19.x |
| **언어** | TypeScript 5.9.x |
| **라우팅** | React Router DOM 7.x |
| **폼** | React Hook Form 7.x |
| **HTTP** | Axios |
| **스타일** | Sass (SCSS), CSS 변수(테마) |
| **기타** | clsx (클래스명 조합) |

---

## 환경 요구사항

- **Node.js**: 20.19 이상을 권장합니다 (Vite 7 공식 요구). 저장소 루트 `.nvmrc`는 `20.19.0`입니다.
- **패키지 매니저**: Yarn

`nvm` 사용 시 프로젝트 루트에서 `nvm use`로 버전을 맞출 수 있습니다.

---

## 설치 및 실행

```bash
# 의존성 설치
yarn install

# 환경 변수 설정 (API 연동 시 필수)
# 프로젝트 루트에 .env 파일을 만들고 아래 내용을 넣습니다.
# VITE_API_BASE_URL=<API 서버 베이스 URL>

# 개발 서버 실행 (기본: http://localhost:5173)
yarn dev

# 빌드
yarn build

# 빌드 결과물 미리보기
yarn preview

# 린트
yarn lint
```

---

## 환경 변수 (.env)

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE_URL` | API 베이스 URL. **로그인·회원가입·게시판** 등 axios 연동에 사용합니다. 미설정 시 해당 API 호출이 실패할 수 있습니다. **사용자 목록·상세**(`selectUserList`, `selectUserDetail`)는 `src/mocks/user.ts` 목 데이터만 사용하며 이 변수와 무관합니다. 값은 `.env`에만 두고 저장소에는 올리지 않습니다. |

---

## 프로젝트 구조

```
src/
├── api/                    # API 모듈 (도메인·HTTP 레이어별 폴더)
│   ├── http/               # axios 인스턴스, api 래퍼, ApiResponse, ApiError
│   ├── auth/               # 토큰(authToken), 로그인, 회원가입(아이디 중복 등)
│   ├── board/              # 게시판 목록/상세/등록/수정/삭제/조회수, DTO 타입
│   └── user/               # 사용자 목록·상세 API 래퍼(현재 mocks만 사용)
├── components/             # 공통 컴포넌트
│   ├── Badge/
│   ├── Button/
│   ├── Confirm/
│   ├── Layout/             # Layout, Header, Footer
│   ├── LoadingState/
│   ├── Pagination/
│   ├── Tooltip/
│   ├── TableSortHeader/    # 게시판 목록 정렬 UI
│   ├── ImageFileAttachField/   # 게시글 이미지 첨부·순서 조정
│   ├── ApiErrorBar/        # API 에러 노출 바(사용처에 따라)
│   ├── icons/              # 소형 아이콘
│   └── index.ts            # 배럴 export (아이콘·첨부 유틸 일부 포함)
├── hooks/
│   ├── usePagination.ts
│   └── useUrlQueryPage.ts  # URL page 쿼리 파싱/갱신 (게시판·사용자 목록 등)
├── mocks/
│   └── user.ts
├── pages/
│   ├── Home.tsx, Home.scss
│   ├── about/
│   │   └── About.tsx, About.scss
│   ├── errors/
│   │   ├── _error-page-shared.scss   # 403/404 공통 믹스인
│   │   ├── Forbidden.tsx, Forbidden.scss   # `/forbidden`
│   │   └── NotFound.tsx, NotFound.scss      # `/not-found`
│   ├── auth/
│   │   ├── _auth-shared.scss   # 로그인·회원가입 공통 SCSS
│   │   ├── login/              # Login.tsx, Login.scss
│   │   └── signup/              # Signup.tsx, Signup.scss
│   ├── user/
│   │   ├── list/               # List.tsx, List.scss — `/user/list`
│   │   ├── detail/             # Detail.tsx, Detail.scss — `/user/detail?userId=`
│   │   └── my-page/            # MyPage.tsx, MyPage.scss — `/user/mypage`
│   ├── post/
│   │   ├── List.tsx, List.scss
│   │   ├── Detail.tsx, Detail.scss        # PostCommentSection, postDetailFromQuery 등
│   │   ├── Write.tsx, Write.scss
│   │   ├── Update.tsx, Update.scss
│   │   ├── PostCommentSection.tsx, PostCommentSection.scss
│   │   ├── postDetailFromQuery.ts
│   │   └── boardListSort.ts
│   └── schedule/
│       ├── Schedule.tsx, Schedule.scss      # `/schedule` (로그인 필수)
│       ├── MonthCalendar.tsx, MonthCalendar.scss, calendarUtils.ts, CalendarPickerPopover.tsx
│       ├── ScheduleSidePanel.tsx, WorkTimeBar.tsx, workTimeUtils.ts 및 각 *.scss
├── router/
│   ├── AppRouter.tsx
│   └── RequireAuth.tsx     # 보호 라우트(토큰 없으면 로그인으로)
├── styles/
│   ├── _color.scss         # 테마 색상 (라이트/다크 CSS 변수)
│   ├── _variables.scss     # 간격·타입·radius·모션 등 (v.space / v.fs / v.fw)
│   ├── _breakpoints.scss   # 반응형 브레이크포인트·믹스인 (below/above)
│   ├── reset.scss          # 전역 리셋·베이스, @keyframes spin (`main.tsx`에서 import)
│   └── common.scss         # 전역 공통: 폼, 목록 헤드, 테이블 mixin, 에러/빈 상태 등
├── App.tsx
└── main.tsx                # `reset.scss`·테마 적용 후 React 마운트
```

- **경로 별칭**: `@` → `src` (예: `@/api/board`, `@/api/auth`, `@/api/http`, `@/components`)
- **도우미 스크립트**: 저장소 루트 `scripts/` — SCSS의 간격·폰트 리터럴을 `v.space`·`v.fs`·`v.fw` 등으로 맞출 때 로컬에서 실행합니다 (`apply-spacing-tokens.py`, `apply-font-tokens.py`).

---

## 라우팅

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | - | `/home`으로 리다이렉트 |
| `/home` | Home | 메인 랜딩 |
| `/auth/login` | Login | 로그인 |
| `/auth/signup` | Signup | 회원가입 |
| `/about` | About | 소개 |
| `/forbidden` | Forbidden | 접근 제한 안내(직접 진입용) |
| `/not-found` | NotFound | 404 안내 |
| `/user/list` | UserList | 사용자 목록 + 페이지네이션 (비로그인 접근 가능, 목 데이터) |
| `/user/detail` | UserDetail | 사용자 상세, 쿼리 `?userId=` (비로그인 접근 가능, 목 데이터) |
| `/user/mypage` | MyPage | 마이페이지 — 프로필·내가 쓴 글 목록 (로그인 필수) |
| `/post/list` | List | 게시글 목록 (로그인 필수) |
| `/post/detail` | Detail | 게시글 상세 (로그인 필수, 쿼리: `?id=`) |
| `/post/update` | Update | 게시글 수정 (로그인 필수, 쿼리: `?id=`) |
| `/post/write` | Write | 게시글 작성 (로그인 필수) |
| `/schedule` | Schedule | 일정 — 월 달력·연·월 선택 팝오버·주 시작 전환 등 (로그인 필수, 백엔드 없음) |
| 그 외 (`*`) | - | `/not-found`로 리다이렉트 (미등록 경로) |

`/home`, `/auth/*`, `/about`, `/user/list`, `/user/detail`, `/forbidden`, `/not-found`는 비로그인 접근 가능합니다. `/post/*`, `/user/mypage`, **`/schedule`**는 `RequireAuth`로 토큰 검사 후 없으면 `/auth/login`으로 이동하며, 이때 토스트·복귀 경로(`state`)를 넘깁니다.  
공개·보호 구간 모두 `Layout`(Header + `Outlet` + Footer) 안에서 렌더됩니다.

**헤더(로그인 시)**: 프로필(이름) → **마이페이지**, 네비에 About · **User**(목록) · Board · **Schedule** · Logout.

---

## 주요 기능

### 다크 모드

- 헤더 토글 버튼으로 라이트/다크 전환.
- `document.documentElement`에 `data-theme="light"` | `"dark"` 적용, `src/styles/_color.scss`의 CSS 변수로 색상 분기.
- `localStorage` 키 `theme`에 저장해 다음 방문 시 동일 테마 적용. 앱 진입 전에 적용해 플래시 방지.

### 로그인 (`/auth/login`)

- React Hook Form으로 아이디/비밀번호 입력, 필수값 검사.
- 비밀번호 보기/숨기기 토글(눈 아이콘).
- 로그인 API 성공 시 토큰·사용자 정보 저장 후 이동, 실패 시 에러 표시.
- 미로그인 시 보호 페이지 접근 → `RequireAuth`에서 로그인으로 이동 + 토스트·복귀 경로(`state.from`) 전달.

### 회원가입 (`/auth/signup`)

- 아이디, 이름, 이메일, 비밀번호 입력. 비밀번호 보기/숨기기 토글.
- 아이디 중복 확인 API 호출 후 “사용가능”일 때만 회원가입 버튼 활성화.
- React Hook Form `mode: "onChange"`로 실시간 유효성 검사.

### 사용자 목록 (`/user/list`)

- **로그인 없이 접근 가능** (`RequireAuth` 밖). 데이터는 `selectUserList` → `src/mocks/user.ts` 목 전용.
- 페이지당 10명, 페이지네이션. `usePagination`, URL `page` 동기화는 `useUrlQueryPage` 사용.
- 로딩/에러/빈 목록 시 공통 `LoadingState` 컴포넌트로 표시.

### 사용자 상세 (`/user/detail?userId=`)

- **로그인 없이 접근 가능** (`RequireAuth` 밖). `selectUserDetail`로 목 데이터에서 `userId` 일치 행 조회. 없으면 안내 메시지.

### 마이페이지 (`/user/mypage`)

- `localStorage`의 `userName`, `userId` 표시.
- **내가 작성한 글**: `getMyPostList` → `GET /posts/me?userId=...` (토큰 필수). `BoardApiError`면 서버 메시지, 그 외는 공통 문구로 에러 표시.

### 일정 (`/schedule`)

- 로그인 필수. **로컬 UI만**(일정 저장·서버 동기화 없음).
- `Schedule` 페이지에서 `MonthCalendar`(월 그리드, 이전·다음 달, 연·월 팝오버, 월요일/일요일 주 시작, 오늘 버튼)와 `ScheduleSidePanel`·`WorkTimeBar` 등을 구성합니다.

### 게시판

- **목록 (`/post/list`)**: 로그인 필수. `GET /posts` 연동. **페이지**: URL 쿼리 `page`만 `useUrlQueryPage`와 동기화(검색어는 URL에 넣지 않음). **검색**: 제목·등록자 ID·등록자 이름 — 「검색」 확정 시에만 API로 전달. **정렬**: `TableSortTh` + `boardListSort.ts`로 글번호·제목·작성자·조회수·등록일 컬럼을 클릭해 순환(디폴트는 등록일 내림차순). API에 `sortColumnName`, `sortType`으로 전달·`page` 범위 보정. 로딩/에러/401 처리·빈 목록 문구(검색 적용 여부에 따라 메시지 분기).
- **상세 (`/post/detail?id=`)**: 조회수 증가 API 후 상세 조회. 수정/삭제 버튼은 작성자만 노출. 잘못된 id 또는 `data: null` 응답 시 “게시글을 찾을 수 없습니다.” 등 메시지 표시.
- **글쓰기 (`/post/write`)**: 제목·내용 입력 후 등록, 성공 시 목록으로 이동.
- **수정 (`/post/update?id=`)**: 상세와 동일 id로 조회 후 제목·내용 수정, 저장 시 상세로 이동.

### Forbidden (`/forbidden`)

- 직접 라우팅된 접근 제한 안내 페이지. “홈으로 돌아가기”, “이전 페이지” 등 버튼 제공.

### Not Found (`/not-found`, 그리고 `path="*"`)

- 정의되지 않은 URL은 `Navigate`로 `/not-found`에 보냅니다. 404 문구와 홈·뒤로 가기 버튼을 둡니다.

---

## 공통 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| **Badge** | 작은 라벨/뱃지 (예: 게시판 타이틀 옆 "📋 Board") |
| **Button** | `variant`: primary, secondary, danger, primaryInverse, secondaryInverse, outlinePrimary, ghost. `size`: sm, md. `to` 주면 Link, `href` 주면 `<a>`, 아니면 `<button>`. 스타일: `components/Button/Button.scss` |
| **Confirm** | 확인/취소 다이얼로그 (예: 게시글 삭제 전 확인) |
| **LoadingState** | 로딩 스피너 + 문구. `message`, `variant`(default \| compact). 목록/검색/상세/수정에서 사용 |
| **Pagination** | 페이지네이션. 현재 페이지, 총 페이지, `onPageChange` |
| **Tooltip** | 말풍선 툴팁 (예: 게시글 제목 말줄임 시) |
| **Layout, Header, Footer** | 레이아웃(스크롤 시 헤더 숨김/표시, 배경·이모지 장식), 헤더(로고, 테마 토글, About / User / Board / Schedule, 프로필·로그인·로그아웃), 푸터 |

배지(badge) 스타일은 `styles/common.scss`에서 한 곳으로 통일되어 있습니다.

---

## API 및 백엔드

- **베이스 URL**: `.env`의 `VITE_API_BASE_URL`. `src/api/http/client.ts`에서 axios `baseURL`로 사용.
- **코드 구조**: HTTP 공통은 `@/api/http`, 인증은 `@/api/auth`, 게시판은 `@/api/board`, 사용자 목록 모듈은 `@/api/user`(각 폴더 `index.ts`에서 재export).
- **주요 경로 예시**:  
  `POST /auth/login`, `POST /auth/join`, `GET /auth/available/user_id`,  
  `GET /posts` (쿼리: `page`, `size`, `sortColumnName`, `sortType`, 검색 키워드 등), `GET /posts/:postNumber`, `GET /posts/me` (쿼리: `userId` — 내 글 목록), `POST /posts`, `PUT /posts/:postNumber`, `DELETE /posts/:postNumber`, `PATCH /posts/:postNumber/view_count`,  
  사용자 목록·상세는 백엔드 없이 `src/mocks/user.ts`만 사용합니다(`userApi.ts`의 `selectUserList`, `selectUserDetail`). 게시판은 실 API(`boardApi.ts` → `api` 래퍼)를 호출합니다.
- **공통 응답**: `resultCode`, `resultMessage`, `resultDetailMessage`, `data`.
- **로그인 성공 여부**: 응답 `resultCode`를 `src/api/auth/login.ts`의 `LOGIN_SUCCESS_CODE`와 비교합니다. 실제 값은 저장소에 노출하지 않고 소스에서만 관리합니다.

백엔드가 위 주소 규격으로 동작해야 로그인·회원가입·게시판 연동이 정상입니다. 사용자 목록은 항상 로컬 mock 기준으로 동작합니다.

---

## 스타일

- **테마**: `src/styles/_color.scss` — `:root`(라이트), `[data-theme="dark"]`(다크) CSS 변수 정의. 전역에서 `var(--color-*)` 사용.
- **토큰**: `src/styles/_variables.scss` — `v.space`, `v.fs`, `v.fw`, `v.rad`, `v.dur` / `v.ease` 등.
- **전역**: `src/styles/reset.scss` — `main.tsx`에서 단일 import. 리셋·미디어/폼 기본, `@keyframes spin`, body·링크·버튼·`#root` 베이스. 내부에서 `_color`·`_variables`를 `@use`합니다.
- **공통**: `src/styles/common.scss` — 배지/카드 placeholder, 섹션 타이틀, 폼(label/input/error), 목록 페이지 헤드(`.list-page-head`), 테이블 공통 mixin, 모바일 테이블 카드 보정(`table-card-mobile-bare`) 등.
- **인증(페이지 전용)**: `src/pages/auth/_auth-shared.scss` — 로그인/회원가입 카드·헤더, 비밀번호 필드·토글. `@/styles/common`을 `@use`·`@forward` 함.
- **컴포넌트**: `components/Button/Button.scss`, `components/LoadingState/LoadingState.scss` 등 컴포넌트별 SCSS.
- **페이지**: 각 화면 폴더의 `*.scss` (예: `user/list/List.scss`, `post/Detail.scss`). 동일 폴더의 TSX에서는 `./Something.scss`로 import하는 패턴을 씁니다.

폰트: Pretendard, Noto Sans KR, 시스템 폰트.

---

## 스크립트 요약

| 명령어 | 설명 |
|--------|------|
| `yarn dev` | Vite 개발 서버 실행 |
| `yarn build` | TypeScript 빌드 후 Vite 프로덕션 빌드 |
| `yarn preview` | 빌드 결과물 로컬 서버로 미리보기 |
| `yarn lint` | ESLint 실행 |

---

## 기타

- **ESLint**: React + TypeScript 규칙 사용.
- **Mock**: `src/mocks/user.ts`만 사용(사용자 목록·상세). 게시판은 실 API 연동.
- **BackstopJS**(선택): 루트 `backstop.json` — 시각 회귀 테스트. `yarn dev` 실행 후 `npx backstop reference` → `npx backstop test`. 프로젝트가 `"type": "module"`이면 엔진 스크립트 `onBefore`/`onReady`는 `require` 충돌이 나므로 설정에서 생략하거나 `.cjs`로 두는 방식을 씁니다.
- **컴포넌트 export**: `src/components/index.ts`는 Badge, Button, Confirm, LoadingState, Header, Footer, Layout, Pagination, Tooltip, TableSortHeader, ImageFileAttachField 및 일부 아이콘·첨부 유틸을 배럴 export합니다 (`ApiErrorBar` 등은 필요 시 해당 파일에서 직접 import).

