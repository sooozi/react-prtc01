# React Practice

Vite + React + TypeScript 기반의 프론트엔드 연습 프로젝트입니다.  
로그인·회원가입·사용자 목록 조회·게시판 목록/글쓰기 등 기본 기능과 라우팅을 다룹니다.

---

## 기술 스택

| 구분        | 기술                   |
| ----------- | ---------------------- |
| **런타임**  | Node.js 20.19+         |
| **빌드/개발** | Vite 7.x               |
| **프레임워크** | React 19.x             |
| **언어**    | TypeScript 5.9.x       |
| **라우팅**  | React Router DOM 7.x  |
| **폼**      | React Hook Form 7.x   |
| **HTTP**    | Axios                 |
| **스타일**  | Sass (SCSS)           |
| **기타**    | clsx (클래스명 조합)   |

---

## 환경 요구사항

- **Node.js**: 20.19 이상 또는 22.12 이상 (Vite 7 요구사항)
- **패키지 매니저**: Yarn

프로젝트 루트에 `.nvmrc`(20.19.0)가 있으면 `nvm use`로 버전을 맞출 수 있습니다.

---

## 설치 및 실행

```bash
# 의존성 설치
yarn install

# 환경 변수 설정 (필수)
# 프로젝트 루트에 .env 파일을 만들고 아래 내용을 넣습니다.
# VITE_API_BASE_URL=<API 서버 베이스 URL, /core 포함>

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
| `VITE_API_BASE_URL` | Core API 베이스 URL (`/core` 경로까지 포함). **필수.** 미설정 시 API 요청 주소가 비어 있어 로그인·게시판 등이 동작하지 않습니다. 실제 값은 `.env`에만 두고 저장소에는 올리지 않습니다. |

코드에서는 이 값을 그대로 사용합니다. (로그인, 회원가입, 게시판 목록/등록)

---

## 프로젝트 구조

```
src/
├── api/                 # API 호출 함수
│   ├── auth.ts          # 회원가입, 아이디 중복 확인
│   ├── login.ts         # 로그인, 성공 여부 판단 (BPLTE200)
│   ├── boardApi.ts      # 게시판 목록 조회, 게시글 등록
│   └── userApi.ts       # 사용자 목록 (목 데이터)
├── components/          # 공통 컴포넌트
│   ├── HighlightText/
│   ├── Layout/          # Layout, Header, Footer
│   └── Pagination/
├── contexts/
│   └── AuthContext.tsx   # (필요 시 인증 컨텍스트)
├── hooks/
│   └── usePagination.ts # 페이지네이션 상태/계산
├── mocks/
│   ├── user.ts          # 사용자 목록 목업
│   └── board.ts         # 게시판 목업 (참고용)
├── pages/
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Forbidden.tsx
│   ├── auth/
│   │   ├── login/       # 로그인
│   │   └── signup/      # 회원가입
│   ├── user/
│   │   ├── Search.tsx    # 사용자 목록(검색)
│   │   └── MyPage.tsx   # 마이페이지
│   └── post/
│       ├── List.tsx     # 게시글 목록
│       └── Write.tsx   # 게시글 작성
├── router/
│   └── AppRouter.tsx    # 라우트 정의
├── styles/
│   ├── common.scss      # 변수, 공통 유틸, 버튼 등
│   └── auth.scss       # 로그인/회원가입 공통
├── App.tsx
├── main.tsx
└── index.css
```

- **경로 별칭**: `@` → `src` (예: `@/api/login`, `@/components`)

---

## 라우팅

| 경로             | 페이지      | 설명                |
| ---------------- | ----------- | ------------------- |
| `/`              | -           | `/home`으로 리다이렉트 |
| `/home`          | Home        | 메인 랜딩            |
| `/auth/login`    | Login       | 로그인               |
| `/auth/signup`   | Signup      | 회원가입             |
| `/about`         | About       | 소개                 |
| `/user/search`   | UserSearch  | 사용자 목록 + 페이지네이션 |
| `/user/mypage`   | MyPage      | 마이페이지           |
| `/post/list`     | List        | 게시글 목록 (로그인 필수) |
| `/post/write`    | Write       | 게시글 작성 (로그인 필수) |
| `/forbidden`     | Forbidden   | 403 접근 제한        |
| 그 외            | -           | `/forbidden`으로 리다이렉트 |

모든 페이지는 `Layout`(Header + Outlet + Footer) 안에서 렌더됩니다.

---

## 주요 기능

### 로그인 (`/auth/login`)

- React Hook Form으로 아이디/비밀번호 입력 및 유효성(필수값) 처리
- 로그인 API 성공 시 토큰 저장 후 이동, 실패 시 에러 표시
- 미로그인 상태에서 로그인이 필요한 페이지 접근 시 로그인 페이지로 리다이렉트 + 토스트 메시지

### 회원가입 (`/auth/signup`)

- 아이디, 이름, 이메일, 비밀번호 입력
- 아이디 중복 확인 API 호출 후 “사용가능”일 때만 회원가입 버튼 활성화
- React Hook Form `mode: "onChange"` 로 실시간 유효성 검사
- API: 회원가입 `POST .../core/auth/join`, 중복 확인 `GET .../core/auth/available/user_id`

### 사용자 목록 (`/user/search`)

- 페이지당 10명, 페이지네이션으로 목록 조회
- `usePagination` 훅으로 현재 페이지/총 개수/총 페이지 관리
- 로딩/에러/빈 목록 UI 처리
- 현재는 목 데이터(`mocks/user.ts`) 사용

### 게시판 목록 (`/post/list`)

- 로그인 필수. 토큰 없으면 로그인 페이지로 리다이렉트
- GET `.../core/posts` (page, size) 로 목록 조회, 페이지네이션
- 번호(postNumber), 제목, 작성자, 작성일 표시
- 401 시 “인증 필요” 메시지 및 로그인 버튼 노출

### 게시글 작성 (`/post/write`)

- 로그인 필수. 제목·내용 입력 후 POST `.../core/posts` 로 등록
- 등록 성공 시 게시판 목록(`/post/list`)으로 이동

### 403 페이지 (`/forbidden`)

- 잘못된 URL 접근 시 표시
- “홈으로 돌아가기” 등 버튼으로 네비게이션

---

## API 및 백엔드

- **베이스 URL**: `.env`의 `VITE_API_BASE_URL` (`/core` 포함). 저장소에는 예시 URL을 넣지 않고, 로컬/배포 환경별로 `.env`에서만 설정합니다.
- **요청 경로**: `{VITE_API_BASE_URL}/auth/login`, `{VITE_API_BASE_URL}/posts` 등
  - 로그인: `POST .../core/auth/login`
  - 회원가입: `POST .../core/auth/join`
  - 아이디 중복: `GET .../core/auth/available/user_id`
  - 게시판 목록: `GET .../core/posts?page=&size=`
  - 게시글 등록: `POST .../core/posts`
- **공통 응답 형태**: `resultCode`, `resultMessage`, `resultDetailMessage`, `data`
- **로그인 성공 코드**: `resultCode === "BPLTE200"` (`api/login.ts`의 `isLoginSuccess`)

백엔드 서버가 해당 주소에서 동작해야 로그인·회원가입·게시판이 정상 동작합니다. 사용자 목록은 목 데이터만 사용합니다.

---

## 스타일

- **공통**: `src/styles/common.scss` — 색상/폰트 변수, 버튼, 폼(input/label/에러 메시지), 배경 장식
- **인증 공통**: `src/styles/auth.scss` — 로그인/회원가입 카드·헤더 공통
- **페이지/컴포넌트**: 각 폴더 내 `*.scss` (예: `Board.scss`, `Login.scss`, `Search.scss`)
- 폰트: Pretendard, Noto Sans KR, 시스템 폰트

---

## 스크립트 요약

| 명령어        | 설명                         |
| ------------- | ---------------------------- |
| `yarn dev`    | Vite 개발 서버 실행          |
| `yarn build`  | TypeScript 빌드 후 Vite 프로덕션 빌드 |
| `yarn preview`| 빌드 결과물 로컬 서버로 미리보기 |
| `yarn lint`   | ESLint 실행                  |

---

## 기타

- **ESLint**: 기본 React + TypeScript 규칙 사용
- **Mock**: `src/mocks/user.ts`(사용자), `src/mocks/board.ts`(게시판 참고용)
- **컴포넌트 export**: `src/components/index.ts`에서 Layout, Header, Footer, Pagination, HighlightText export
