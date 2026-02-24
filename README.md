# React Practice (MyViteProject)

Vite + React + TypeScript 기반의 프론트엔드 연습 프로젝트입니다.  
로그인·회원가입·사용자 목록 조회 등 기본 CRUD와 라우팅을 다룹니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **런타임** | Node.js 20.19+ |
| **빌드/개발** | Vite 7.x |
| **프레임워크** | React 19.x |
| **언어** | TypeScript 5.9.x |
| **라우팅** | React Router DOM 7.x |
| **폼** | React Hook Form 7.x |
| **HTTP** | Axios |
| **스타일** | Sass (SCSS) |
| **기타** | clsx (클래스명 조합) |

---

## 환경 요구사항

- **Node.js**: 20.19 이상 또는 22.12 이상 (Vite 7 요구사항)
- **패키지 매니저**: Yarn

프로젝트 루트에 `.nvmrc`(20.19.0)가 있으므로 `nvm use`로 버전을 맞추면 됩니다.

---

## 설치 및 실행

```bash
# 의존성 설치
yarn install

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

## 프로젝트 구조

```
src/
├── api/                 # API 호출 함수
│   ├── auth.ts          # 회원가입, 아이디 중복 확인
│   ├── login.ts         # 로그인, 성공 여부 판단
│   └── userApi.ts       # 사용자 목록 조회
├── components/          # 공통 컴포넌트
│   ├── HighlightText/
│   ├── Layout/          # Layout, Header, Footer
│   └── Pagination/
├── hooks/
│   └── usePagination.ts # 페이지네이션 상태/계산
├── mocks/
│   └── user.ts          # 목업 사용자 데이터
├── pages/               # 페이지 컴포넌트
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Forbidden.tsx
│   ├── auth/
│   │   ├── login/       # 로그인
│   │   └── signup/      # 회원가입
│   └── user/
│       └── Search.tsx   # 사용자 목록(검색)
├── router/
│   └── AppRouter.tsx    # 라우트 정의
├── styles/              # 공통 스타일
│   ├── common.scss      # 변수, 공통 유틸, 버튼 등
│   └── auth.scss       # 로그인/회원가입 공통
├── App.tsx
├── main.tsx
└── index.css
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
| `/forbidden` | Forbidden | 403 접근 제한 |
| 그 외 | - | `/forbidden`으로 리다이렉트 |

모든 페이지는 `Layout`(Header + Outlet + Footer) 안에서 렌더됩니다.

---

## 주요 기능

### 로그인 (`/auth/login`)

- React Hook Form으로 아이디/비밀번호 입력 및 유효성(필수값) 처리
- 아이디·비밀번호 모두 입력 시에만 로그인 버튼 활성화
- 로그인 API 성공 시 `/user/search`로 이동, 실패 시 에러 알림(빨간 박스)
- 성공 시 알림(초록 박스) 후 이동
- API: `POST http://localhost:8081/bplte/core/auth/login`

### 회원가입 (`/auth/signup`)

- 아이디, 이름, 이메일, 비밀번호 입력
- 아이디 중복 확인 API 호출 후 “사용가능”일 때만 회원가입 버튼 활성화
- React Hook Form `mode: "onChange"` 로 실시간 유효성 검사
- API: 회원가입 `POST .../auth/join`, 중복 확인 `GET .../auth/available/user_id`

### 사용자 목록 (`/user/search`)

- 페이지당 10명, 페이지네이션으로 목록 조회
- `usePagination` 훅으로 현재 페이지/총 개수/총 페이지 관리
- API: `POST http://localhost:8082/common/api/user_mng/v1/select_user/list`
- 로딩/에러/빈 목록 UI 처리

### 403 페이지 (`/forbidden`)

- 잘못된 URL 접근 시 표시
- “홈으로 돌아가기” 등 버튼으로 네비게이션

---

## API 및 백엔드

- **로그인/회원가입**: `http://localhost:8081` (bplte/core/auth)
- **사용자 목록**: `http://localhost:8082` (common/api/user_mng)
- 공통 응답 형태: `resultCode`, `resultMessage`, `resultDetailMessage`, `data`
- 로그인 성공 코드: `api/login.ts`의 `LOGIN_SUCCESS_CODES`에 정의 (SUCCESS, BPLTE200, 0000, 200, 0 등)

백엔드 서버가 해당 포트에서 동작해야 로그인·회원가입·사용자 목록이 정상 동작합니다.

---

## 스타일

- **공통**: `src/styles/common.scss` — 색상/폰트 변수, 버튼, 폼(input/label/에러 메시지), 배경 장식
- **인증 공통**: `src/styles/auth.scss` — 로그인/회원가입 카드·헤더 공통 플레이스홀더
- **페이지/컴포넌트**: 각 폴더 내 `*.scss` (예: `Login.scss`, `Search.scss`)
- 폰트: Pretendard, Noto Sans KR, 시스템 폰트

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

- **ESLint**: 기본 React + TypeScript 규칙 사용
- **Mock**: `src/mocks/user.ts`에 사용자 목업 데이터 정의 (필요 시 참고)
- **컴포넌트 export**: `src/components/index.ts`에서 Layout, Header, Footer, Pagination, HighlightText 등 export
