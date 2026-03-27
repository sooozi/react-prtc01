# React Practice

Vite + React + TypeScript 기반의 프론트엔드 연습 프로젝트입니다.  
로그인·회원가입·사용자 목록·게시판(목록/상세/글쓰기/수정/삭제), 다크 모드, 공통 컴포넌트(Button, LoadingState 등)를 다룹니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **런타임** | Node.js 20+ |
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

- **Node.js**: 20.x 이상 (Vite 7 권장)
- **패키지 매니저**: Yarn

프로젝트 루트에 `.nvmrc`가 있으면 `nvm use`로 Node 버전을 맞출 수 있습니다.

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
| `VITE_API_BASE_URL` | API 베이스 URL. 로그인·회원가입·게시판·사용자 목록 등 모든 API 요청에 사용. 미설정 시 요청 주소가 비어 있어 API 연동이 동작하지 않습니다. 실제 값은 `.env`에만 두고 저장소에는 올리지 않습니다. |

---

## 프로젝트 구조

```
src/
├── api/                    # API 호출
│   ├── client.ts           # axios 인스턴스 (baseURL, 공통 헤더)
│   ├── types.ts            # 공통 응답 타입
│   ├── auth.ts             # 회원가입, 아이디 중복 확인
│   ├── login.ts            # 로그인 (성공 코드는 소스 내 상수)
│   ├── boardApi.ts         # 게시판 목록/상세/등록/수정/삭제/조회수
│   ├── boardApi.types.ts    # 게시판 DTO·요청 타입
│   └── userApi.ts          # 사용자 목록 조회
├── components/             # 공통 컴포넌트
│   ├── Badge/
│   ├── Button/             # 버튼 (variant: primary, secondary, danger, ghost 등)
│   ├── Confirm/            # 확인 다이얼로그
│   ├── HighlightText/
│   ├── Layout/             # Layout, Header, Footer
│   ├── LoadingState/       # 로딩 스피너 + 문구
│   ├── Pagination/
│   ├── Tooltip/
│   ├── CatHover/
│   └── index.ts            # 컴포넌트 export
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── usePagination.ts
├── mocks/
│   ├── user.ts
│   └── board.ts
├── pages/
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Forbidden.tsx
│   ├── auth/
│   │   ├── login/          # Login.tsx, Login.scss
│   │   └── signup/         # Signup.tsx, Signup.scss
│   ├── user/
│   │   ├── Search.tsx      # 사용자 목록 + 페이지네이션
│   │   └── MyPage.tsx      # 마이페이지
│   └── post/
│       ├── List.tsx        # 게시글 목록
│       ├── Detail.tsx      # 게시글 상세
│       ├── Write.tsx       # 게시글 작성
│       └── Update.tsx      # 게시글 수정
├── router/
│   └── AppRouter.tsx
├── styles/
│   ├── _color.scss         # 테마 색상 (라이트/다크 CSS 변수)
│   ├── common.scss         # 변수, 배지, 카드, 폼 공통, @use buttons
│   └── auth.scss          # 로그인/회원가입 공통, 비밀번호 토글
├── App.tsx
├── main.tsx                # 저장된 테마 적용 후 React 마운트
└── index.scss              # 전역 리셋, @keyframes spin, 테마 변수 로드
```

- **경로 별칭**: `@` → `src` (예: `@/api/login`, `@/components`)

---

## 라우팅

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | - | `/home`으로 리다이렉트 |
| `/home` | Home | 메인 랜딩 |
| `/auth/login` | Login | 로그인 |
| `/auth/signup` | Signup | 회원가입 |
| `/about` | About | 소개 |
| `/user/search` | UserSearch | 사용자 목록 + 페이지네이션 |
| `/user/mypage` | MyPage | 마이페이지 (로그인 필수) |
| `/post/list` | List | 게시글 목록 (로그인 필수) |
| `/post/detail` | Detail | 게시글 상세 (쿼리: `?id=`) |
| `/post/update` | Update | 게시글 수정 (쿼리: `?id=`) |
| `/post/write` | Write | 게시글 작성 |
| `/forbidden` | Forbidden | 403 접근 제한 |
| 그 외 | - | `/forbidden`으로 리다이렉트 |

모든 페이지는 `Layout`(Header + Outlet + Footer) 안에서 렌더됩니다.

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
- 미로그인 시 보호 페이지 접근 → 로그인 페이지 리다이렉트 + 토스트 메시지.

### 회원가입 (`/auth/signup`)

- 아이디, 이름, 이메일, 비밀번호 입력. 비밀번호 보기/숨기기 토글.
- 아이디 중복 확인 API 호출 후 “사용가능”일 때만 회원가입 버튼 활성화.
- React Hook Form `mode: "onChange"`로 실시간 유효성 검사.

### 사용자 목록 (`/user/search`)

- 페이지당 10명, 페이지네이션. `usePagination` 훅 사용.
- 로딩/에러/빈 목록 시 공통 `LoadingState` 컴포넌트로 표시.

### 게시판

- **목록 (`/post/list`)**: 로그인 필수. 목록 조회 + 페이지네이션 + 정렬. URL 쿼리 `page`, `sort`(정렬 기준), `order`(ASC/DESC)를 사용하며, 정렬 선택 시 URL이 바뀌고 해당 값이 API의 `sortColumnName`, `sortType`으로 전달됨. 정렬 옵션: 최신순(regDt), 제목순(title), 조회순(inqCnt). URL `page` 파라미터 유효성 보정(음수·초과 시 1 또는 마지막 페이지로 정리). 로딩/에러/빈 목록 처리.
- **상세 (`/post/detail?id=`)**: 조회수 증가 API 후 상세 조회. 수정/삭제 버튼은 작성자만 노출. 잘못된 id 또는 `data: null` 응답 시 “게시글을 찾을 수 없습니다.” 등 메시지 표시.
- **글쓰기 (`/post/write`)**: 제목·내용 입력 후 등록, 성공 시 목록으로 이동.
- **수정 (`/post/update?id=`)**: 상세와 동일 id로 조회 후 제목·내용 수정, 저장 시 상세로 이동.

### 403 페이지 (`/forbidden`)

- 잘못된 URL 접근 시 표시. “홈으로 돌아가기”, “이전 페이지” 버튼.

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
| **Layout, Header, Footer** | 레이아웃과 헤더(로고, 테마 토글, 네비, 로그인/로그아웃), 푸터 |

배지(badge) 스타일은 `styles/common.scss`에서 한 곳으로 통일되어 있습니다.

---

## API 및 백엔드

- **베이스 URL**: `.env`의 `VITE_API_BASE_URL`. `api/client.ts`에서 axios `baseURL`로 사용.
- **주요 경로 예시**:  
  `POST /auth/login`, `POST /auth/join`, `GET /auth/available/user_id`,  
  `GET /posts` (쿼리: `page`, `size`, `sortColumnName`, `sortType`), `GET /posts/:postNumber`, `POST /posts`, `PUT /posts/:postNumber`, `DELETE /posts/:postNumber`, `PATCH /posts/:postNumber/view_count`,  
  사용자 목록 API(경로는 `userApi.ts` 참고).
- **공통 응답**: `resultCode`, `resultMessage`, `resultDetailMessage`, `data`.
- **로그인 성공 여부**: 응답 `resultCode`를 `api/login.ts`의 `LOGIN_SUCCESS_CODE`와 비교해 판단합니다. 실제 값은 저장소에 노출하지 않고 소스에서만 관리합니다.

백엔드가 위 주소 규격으로 동작해야 로그인·회원가입·게시판·사용자 목록이 정상 동작합니다.

---

## 스타일

- **테마**: `src/styles/_color.scss` — `:root`(라이트), `[data-theme="dark"]`(다크) CSS 변수 정의. 전역에서 `var(--color-*)` 사용.
- **전역**: `src/index.scss` — 리셋, `@keyframes spin`, body/버튼 기본 스타일. `@use "@/styles/color"` 로 테마 로드.
- **공통**: `src/styles/common.scss` — 폰트/색 변수, 배지, 카드, 섹션 타이틀, 폼(label/input/error), `@use` buttons. `.submit-button` 풀너비 버튼.
- **인증**: `src/styles/auth.scss` — 로그인/회원가입 카드·헤더, 비밀번호 필드·토글 스타일.
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
- **Mock**: `src/mocks/user.ts`, `src/mocks/board.ts` (참고용).
- **컴포넌트 export**: `src/components/index.ts`에서 Badge, Button, Confirm, HighlightText, LoadingState, Header, Footer, Layout, Pagination, Tooltip export.
