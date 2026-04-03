# React Practice

Vite + React + TypeScript 기반의 프론트엔드 연습 프로젝트입니다.  
로그인·회원가입·사용자 목록(`/user/list`)·게시판(목록/상세/글쓰기/수정/삭제), 다크 모드, 공통 컴포넌트를 다룹니다.  
레이아웃은 스크롤 방향에 따라 헤더를 숨겼다 보였다 하며, `MouseFollowEmoji`로 포인터 추적 장식을 둡니다.

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
| `VITE_API_BASE_URL` | API 베이스 URL. **로그인·회원가입·게시판** 등 axios 연동에 사용합니다. 미설정 시 해당 API 호출이 실패할 수 있습니다. **사용자 목록**(`selectUserList`)은 `src/mocks/user.ts` 목 데이터만 사용하며 이 변수와 무관합니다. 값은 `.env`에만 두고 저장소에는 올리지 않습니다. |

---

## 프로젝트 구조

```
src/
├── api/                    # API 모듈 (도메인·HTTP 레이어별 폴더)
│   ├── http/               # axios 인스턴스, api 래퍼, ApiResponse, ApiError
│   ├── auth/               # 토큰(authToken), 로그인, 회원가입(아이디 중복 등)
│   ├── board/              # 게시판 목록/상세/등록/수정/삭제/조회수, DTO 타입
│   └── user/               # 사용자 목록(현재 mocks 연동)
├── components/             # 공통 컴포넌트
│   ├── Badge/
│   ├── Button/             # 버튼 (variant: primary, secondary, danger, ghost 등)
│   ├── Confirm/            # 확인 다이얼로그
│   ├── Layout/             # Layout(스크롤 시 헤더 숨김), Header, Footer
│   ├── LoadingState/       # 로딩 스피너 + 문구
│   ├── MouseFollowEmoji/   # Layout에서 포인터 따라다니는 이모지
│   ├── Pagination/
│   ├── Tooltip/
│   ├── CatHover/           # (선택) Layout에서 주석 처리 가능
│   └── index.ts            # 배럴 export (MouseFollowEmoji 등은 Layout에서 직접 import)
├── hooks/
│   ├── usePagination.ts
│   └── useUrlQueryPage.ts  # URL page 쿼리 파싱/갱신 (게시판·사용자 목록 등)
├── mocks/
│   ├── user.ts
│   └── board.ts
├── pages/
│   ├── Home.tsx
│   ├── about/
│   │   └── About.tsx
│   ├── Forbidden.tsx
│   ├── auth/
│   │   ├── _auth-shared.scss  # 로그인·회원가입 공통 SCSS (카드, 비밀번호 토글)
│   │   ├── login/             # Login.tsx, Login.scss
│   │   └── signup/            # Signup.tsx, Signup.scss
│   ├── user/
│   │   ├── List.tsx, List.scss   # 사용자 목록 + 페이지네이션 (`UserList`, `/user/list`)
│   │   └── MyPage.tsx, MyPage.scss
│   └── post/
│       ├── List.tsx        # 게시글 목록
│       ├── Detail.tsx      # 게시글 상세
│       ├── Write.tsx       # 게시글 작성
│       └── Update.tsx      # 게시글 수정
├── router/
│   ├── AppRouter.tsx
│   └── RequireAuth.tsx     # 보호 라우트(토큰 없으면 로그인으로)
├── styles/
│   ├── _color.scss         # 테마 색상 (라이트/다크 CSS 변수)
│   ├── _breakpoints.scss   # 반응형 브레이크포인트·믹스인 (below/above)
│   └── common.scss         # 전역 공통: 폼, 목록 헤드, 테이블 mixin, 에러/빈 상태 등
├── App.tsx
├── main.tsx                # 저장된 테마 적용 후 React 마운트
└── index.scss              # 전역 리셋, @keyframes spin, 테마 변수 로드
```

- **경로 별칭**: `@` → `src` (예: `@/api/board`, `@/api/auth`, `@/api/http`, `@/components`)

---

## 라우팅

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | - | `/home`으로 리다이렉트 |
| `/home` | Home | 메인 랜딩 |
| `/auth/login` | Login | 로그인 |
| `/auth/signup` | Signup | 회원가입 |
| `/about` | About | 소개 |
| `/user/list` | UserList | 사용자 목록 + 페이지네이션 |
| `/user/search` | - | `/user/list`로 리다이렉트(구 경로) |
| `/user/mypage` | MyPage | 마이페이지 (로그인 필수) |
| `/post/list` | List | 게시글 목록 (로그인 필수, 컴포넌트는 `post/List`) |
| `/post/detail` | Detail | 게시글 상세 (쿼리: `?id=`) |
| `/post/update` | Update | 게시글 수정 (쿼리: `?id=`) |
| `/post/write` | Write | 게시글 작성 |
| `/forbidden` | Forbidden | 403 접근 제한 |
| 그 외 (`*`) | - | `/forbidden`으로 리다이렉트 (미등록 경로) |

`/home`, `/auth/*`, `/about`, `/forbidden`은 비로그인 접근 가능합니다. `/post/*`, `/user/list`, `/user/mypage` 등은 `RequireAuth`로 토큰 검사 후 없으면 `/auth/login`으로 이동하며, 이때 토스트·복귀 경로(`state`)를 넘깁니다.  
`/user/search`는 구 경로로, `/user/list`로 치환 리다이렉트됩니다.  
공개·보호 구간 모두 `Layout`(Header + `Outlet` + Footer) 안에서 렌더됩니다.

**헤더 네비(로그인 시)**: About, **User**(사용자 목록), Board(게시판), Logout.

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

- 페이지당 10명, 페이지네이션. `usePagination`, URL `page` 동기화는 `useUrlQueryPage` 사용.
- 로딩/에러/빈 목록 시 공통 `LoadingState` 컴포넌트로 표시.

### 게시판

- **목록 (`/post/list`)**: 로그인 필수. `GET /posts` 연동. 페이지네이션·정렬·검색(제목, 등록자 ID, 등록자 이름 — 확정 시에만 API로 전달, URL에는 검색어 미반영). URL 쿼리 `page`, `sort`, `order`(ASC/DESC)는 `useUrlQueryPage`와 동기화하고, API에는 `sortColumnName`, `sortType`으로 전달. 정렬 기준: `regDt`(최신), `title`, `inqCnt`, `postNumber`, `rgtrName`. 테이블 헤더 정렬 버튼으로 컬럼·방향 토글 가능. `page` 범위 보정. 로딩/에러/401 처리·빈 목록 문구.
- **상세 (`/post/detail?id=`)**: 조회수 증가 API 후 상세 조회. 수정/삭제 버튼은 작성자만 노출. 잘못된 id 또는 `data: null` 응답 시 “게시글을 찾을 수 없습니다.” 등 메시지 표시.
- **글쓰기 (`/post/write`)**: 제목·내용 입력 후 등록, 성공 시 목록으로 이동.
- **수정 (`/post/update?id=`)**: 상세와 동일 id로 조회 후 제목·내용 수정, 저장 시 상세로 이동.

### Forbidden 페이지 (`/forbidden`)

- 라우터에 정의되지 않은 경로(`path="*"`)는 여기로 리다이렉트됩니다. (HTTP 403과 문구는 다를 수 있음.) “홈으로 돌아가기”, “이전 페이지” 등 안내 버튼을 둡니다.

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
| **Layout, Header, Footer** | 레이아웃(스크롤 시 헤더 숨김/표시, 배경·이모지 장식), 헤더(로고, 테마 토글, About / User / Board, 프로필·로그인·로그아웃), 푸터 |

배지(badge) 스타일은 `styles/common.scss`에서 한 곳으로 통일되어 있습니다.

---

## API 및 백엔드

- **베이스 URL**: `.env`의 `VITE_API_BASE_URL`. `src/api/http/client.ts`에서 axios `baseURL`로 사용.
- **코드 구조**: HTTP 공통은 `@/api/http`, 인증은 `@/api/auth`, 게시판은 `@/api/board`, 사용자 목록 모듈은 `@/api/user`(각 폴더 `index.ts`에서 재export).
- **주요 경로 예시**:  
  `POST /auth/login`, `POST /auth/join`, `GET /auth/available/user_id`,  
  `GET /posts` (쿼리: `page`, `size`, `sortColumnName`, `sortType`, 검색 키워드 등), `GET /posts/:postNumber`, `POST /posts`, `PUT /posts/:postNumber`, `DELETE /posts/:postNumber`, `PATCH /posts/:postNumber/view_count`,  
  사용자 목록은 백엔드 없이 `src/mocks/user.ts`만 사용합니다(`userApi.ts` 참고). 게시판은 실 API(`boardApi.ts` → `api` 래퍼)를 호출합니다.
- **공통 응답**: `resultCode`, `resultMessage`, `resultDetailMessage`, `data`.
- **로그인 성공 여부**: 응답 `resultCode`를 `src/api/auth/login.ts`의 `LOGIN_SUCCESS_CODE`와 비교합니다. 실제 값은 저장소에 노출하지 않고 소스에서만 관리합니다.

백엔드가 위 주소 규격으로 동작해야 로그인·회원가입·게시판 연동이 정상입니다. 사용자 목록은 항상 로컬 mock 기준으로 동작합니다.

---

## 스타일

- **테마**: `src/styles/_color.scss` — `:root`(라이트), `[data-theme="dark"]`(다크) CSS 변수 정의. 전역에서 `var(--color-*)` 사용.
- **전역**: `src/index.scss` — 리셋, `@keyframes spin`, body/버튼 기본 스타일. `@use "@/styles/color"` 로 테마 로드.
- **공통**: `src/styles/common.scss` — 폰트/색 변수, 배지/카드 placeholder, 섹션 타이틀, 폼(label/input/error), 목록 페이지 헤드(`.list-page-head`), 테이블 공통 mixin, 모바일 테이블 카드 보정(`table-card-mobile-bare`) 등.
- **인증(페이지 전용)**: `src/pages/auth/_auth-shared.scss` — 로그인/회원가입 카드·헤더, 비밀번호 필드·토글. `@/styles/common`을 `@use`·`@forward` 함.
- **컴포넌트**: `components/Button/Button.scss`, `components/LoadingState/LoadingState.scss` 등 컴포넌트별 SCSS.
- **페이지**: 각 페이지 폴더 내 `*.scss` (예: `List.scss`, `Detail.scss`).

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
- **Mock**: `src/mocks/user.ts`만 런타임에서 사용(사용자 목록). `src/mocks/board.ts`는 저장소에 두었으나 현재 코드에서 import하지 않습니다(게시판은 실 API).
- **컴포넌트 export**: `src/components/index.ts`는 Badge, Button, Confirm, LoadingState, Header, Footer, Layout, Pagination, Tooltip만 배럴 export. `MouseFollowEmoji`, `CatHover` 등은 필요한 파일에서 경로로 import합니다.

