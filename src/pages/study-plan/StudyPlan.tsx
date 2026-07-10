import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, PageHeader } from "@/components";
import "@/pages/study-plan/StudyPlan.scss";

type StudyFile = {
  path: string;
  hint: string;
};

type StudyPhase = {
  id: string;
  phase: string;
  title: string;
  duration: string;
  summary: string;
  goals: string[];
  concepts: string[];
  readFiles: StudyFile[];
  practice: string[];
  checkpoints: string[];
  tryRoute?: string;
  tryLabel?: string;
};

const PRINCIPLES = [
  {
    icon: "📖",
    title: "화면 → 코드 순서",
    text: "먼저 브라우저에서 동작을 확인한 뒤, 해당 페이지 TSX부터 열고 import를 따라갑니다.",
  },
  {
    icon: "🔍",
    title: "한 기능씩 끊어서",
    text: "게시판 목록·상세·작성을 한 번에 보지 말고, 한 API 호출 흐름만 추적해 끝까지 따라갑니다.",
  },
  {
    icon: "✍️",
    title: "읽기 + 작은 수정",
    text: "라벨 문구 변경, 정렬 기본값 바꾸기, Storybook args 추가처럼 작은 diff로 구조를 몸에 익힙니다.",
  },
  {
    icon: "🧪",
    title: "도구를 같이 켜기",
    text: "React DevTools, Network 탭, `yarn storybook`, `yarn test`를 단계마다 함께 사용합니다.",
  },
] as const;

const TOPIC_MAP = [
  { topic: "라우팅·인증", files: "router/AppRouter.tsx, RequireAuth.tsx, LazyRoute.tsx" },
  { topic: "HTTP·에러", files: "api/http/client.ts, http.ts, apiErrorDisplay.ts" },
  { topic: "폼·검증", files: "schemas/auth/, pages/auth/, react-hook-form + zod" },
  { topic: "게시판", files: "api/board/, pages/post/, lib/post/" },
  { topic: "에디터·첨부", files: "RichTextEditor/, ImageFileAttachField/" },
  { topic: "일정·달력", files: "pages/schedule/, lib/schedule/, krHolidays.ts" },
  { topic: "접근성", files: "RouteHeadSync, useFloatingLayer, bootstrapAxe, jsx-a11y" },
  { topic: "스타일", files: "styles/_variables.scss, style-guide/, 각 페이지 SCSS" },
] as const;

const STUDY_PHASES: StudyPhase[] = [
  {
    id: "phase-0",
    phase: "Phase 0",
    title: "환경 세팅 & 프로젝트 지도 읽기",
    duration: "1~2일",
    summary: "실행 환경을 맞추고, 폴더 구조와 데이터 경계(mock / API / localStorage)를 파악합니다.",
    goals: [
      "Node 20.19+, yarn install, yarn dev로 앱 실행",
      "pages / components / api / lib / hooks 역할 구분",
      "어떤 기능이 실 API·mock·localStorage인지 표로 정리",
    ],
    concepts: ["Vite HMR", "path alias (@/)", "환경 변수 VITE_API_BASE_URL"],
    readFiles: [
      { path: "README.md", hint: "전체 범위·기술 스택·데이터 경계" },
      { path: "docs/folder-structure.md", hint: "폴더 배치 규칙" },
      { path: "src/main.tsx → App.tsx → router/AppRouter.tsx", hint: "앱 진입 흐름" },
      { path: "src/components/Layout/Layout.tsx", hint: "헤더·main·에러바운더리" },
    ],
    practice: [
      "`yarn dev`로 주요 메뉴(홈, About, 게시판, 일정) 직접 이동",
      "`yarn storybook`으로 Button·PageHeader 스토리 열어보기",
      "README의 아키텍처 다이어그램을 보며 실제 폴더와 대조",
    ],
    checkpoints: [
      "src/pages와 src/components 차이를 설명할 수 있다",
      "게시판은 API, 사용자 목록은 mock, 일정은 localStorage임을 안다",
      "로그인 없이 /post/list 접근 시 로그인으로 리다이렉트됨을 확인했다",
    ],
    tryRoute: "/about",
    tryLabel: "About에서 프로젝트 범위 보기",
  },
  {
    id: "phase-1",
    phase: "Phase 1",
    title: "React·라우팅·레이아웃 기초",
    duration: "3~5일",
    summary: "컴포넌트 조합, React Router, 공통 레이아웃·페이지 헤더 패턴을 익힙니다.",
    goals: [
      "함수형 컴포넌트·props·state·useEffect 기본 복습",
      "React Router 7의 Route, Outlet, Navigate, lazy 이해",
      "PageHeader·Button 등 공용 UI 사용법 파악",
    ],
    concepts: [
      "JSX",
      "useState / useEffect",
      "React Router nested routes",
      "code splitting (lazy)",
    ],
    readFiles: [
      { path: "src/router/AppRouter.tsx", hint: "전체 라우트 맵" },
      { path: "src/router/RequireAuth.tsx", hint: "인증 가드" },
      { path: "src/router/LazyRoute.tsx", hint: "스켈레톤 + lazy 로딩" },
      { path: "src/pages/home/Home.tsx", hint: "단순 페이지 예시" },
      { path: "src/components/ui/PageHeader/PageHeader.tsx", hint: "페이지 상단 패턴" },
    ],
    practice: [
      "Header 메뉴 클릭 시 URL·화면·document title이 함께 바뀌는지 관찰",
      "모바일(767px 이하)에서 드로어 메뉴·포커스 트랩 동작 확인",
      "Storybook에서 Button variant·size 조합 실험",
    ],
    checkpoints: [
      "RequireAuth가 token을 어떻게 검사하는지 말할 수 있다",
      "lazy 로딩 페이지 진입 시 스켈레톤이 보이는 이유를 안다",
      "PageHeader의 variant·as prop 차이를 이해했다",
    ],
    tryRoute: "/home",
    tryLabel: "홈에서 레이아웃 확인",
  },
  {
    id: "phase-2",
    phase: "Phase 2",
    title: "스타일 시스템 & 재사용 컴포넌트",
    duration: "약 1주",
    summary: "SCSS 토큰, 다크 모드, 스타일 가이드, Storybook으로 디자인 시스템을 학습합니다.",
    goals: [
      "CSS 변수·SCSS 토큰(v.space, v.fs 등)으로 스타일 일관성 유지",
      "data-theme 기반 라이트/다크 전환 원리 이해",
      "공용 컴포넌트를 Storybook에서 독립적으로 검증",
    ],
    concepts: ["SCSS @use", "design tokens", "BEM-like 네이밍", "반응형 breakpoint"],
    readFiles: [
      { path: "src/styles/_variables.scss", hint: "색·간격·타이포 토큰" },
      { path: "src/pages/style-guide/StyleGuide.tsx", hint: "토큰·컴포넌트 미리보기" },
      { path: "src/components/ui/Button/Button.tsx", hint: "variant 패턴" },
      { path: "src/components/index.ts", hint: "배럴 export 구조" },
      { path: ".storybook/preview.tsx", hint: "Storybook 전역 테마" },
    ],
    practice: [
      "헤더에서 다크 모드 토글 후 style-guide·게시판 색상 비교",
      "Button.stories.tsx를 열어 variant별 스토리 구조 파악",
      "About 또는 Study 페이지 SCSS에서 토큰만 바꿔 spacing 실험",
    ],
    checkpoints: [
      "새 페이지 SCSS에 @use variables 패턴을 적용할 수 있다",
      "Storybook에서 컴포넌트를 앱 없이 확인하는 이유를 안다",
      "공용 vs pages/.../components 분리 기준을 설명할 수 있다",
    ],
    tryRoute: "/style-guide",
    tryLabel: "스타일 가이드 둘러보기",
  },
  {
    id: "phase-3",
    phase: "Phase 3",
    title: "폼·Zod·인증·HTTP 클라이언트",
    duration: "1~2주",
    summary: "로그인/회원가입 폼과 Axios 인터셉터를 통해 API 연동의 기본 뼈대를 익힙니다.",
    goals: [
      "React Hook Form + Zod resolver로 폼 검증 흐름 이해",
      "토큰 저장·Authorization 헤더·401 처리 파악",
      "ApiError 타입과 화면 에러 표시 연결",
    ],
    concepts: ["controlled vs RHF register", "zod schema", "axios interceptor", "Bearer token"],
    readFiles: [
      { path: "src/schemas/auth/loginSchema.ts", hint: "Zod 스키마 예시" },
      { path: "src/pages/auth/login/Login.tsx", hint: "폼 + API 호출" },
      { path: "src/api/auth/authToken.ts", hint: "토큰 get/set" },
      { path: "src/api/http/client.ts", hint: "요청·응답 인터셉터" },
      { path: "src/api/http/http.ts", hint: "api.get/post 래퍼" },
    ],
    practice: [
      "로그인 성공·실패·빈 값 제출 각각 Network 탭으로 요청 확인",
      "401 발생 시 로그인 리다이렉트·sessionStorage 안내 메시지 관찰",
      "회원가입에서 아이디 중복 검사 API 흐름 추적",
    ],
    checkpoints: [
      "Zod 에러가 폼 필드 아래에 어떻게 매핑되는지 안다",
      "api vs apiClient 사용 구분을 설명할 수 있다",
      "localStorage의 token·userName이 어디서 쓰이는지 찾았다",
    ],
    tryRoute: "/auth/login",
    tryLabel: "로그인 폼 실습",
  },
  {
    id: "phase-4",
    phase: "Phase 4",
    title: "게시판 CRUD·목록·댓글·첨부",
    duration: "1~2주",
    summary: "가장 복잡한 도메인인 게시판을 목록→상세→작성→수정→댓글 순으로 깊게 파고듭니다.",
    goals: [
      "검색·정렬·페이지네이션 쿼리 파라미터 흐름 이해",
      "multipart/form-data 게시글·첨부 업로드 구조 파악",
      "Quill 에디터·DOMPurify·댓글 트리 UI 학습",
    ],
    concepts: [
      "URL search params",
      "multipart upload",
      "optimistic UI",
      "infinite scroll",
      "tree flatten",
    ],
    readFiles: [
      { path: "src/pages/post/list/List.tsx", hint: "테이블/카드 반응형·정렬" },
      { path: "src/api/board/boardApi.ts", hint: "게시판 전 API" },
      { path: "src/pages/post/write/Write.tsx", hint: "에디터 + 첨부" },
      { path: "src/components/RichTextEditor/", hint: "Quill 래퍼" },
      { path: "src/components/ImageFileAttachField/", hint: "첨부·순서·allowlist" },
      { path: "src/pages/post/components/CommentSection.tsx", hint: "댓글 API·트리" },
    ],
    practice: [
      "게시글 CRUD 한 사이클을 직접 수행하며 Network 요청 기록",
      "모바일·데스크톱에서 목록 UI 차이 비교",
      "첨부 파일 확장자 제한·용량 초과 에러 확인",
      "댓글 등록·대댓글·반응 API 호출 흐름 추적",
    ],
    checkpoints: [
      "목록 sortType·검색어가 URL과 어떻게 연동되는지 안다",
      "Write와 Update의 ImageFileAttachField variant 차이를 설명할 수 있다",
      "상세 HTML이 DOMPurify를 거치는 이유를 안다",
    ],
    tryRoute: "/post/list",
    tryLabel: "게시판부터 시작",
  },
  {
    id: "phase-5",
    phase: "Phase 5",
    title: "일정·훅·접근성·심화",
    duration: "약 1주",
    summary: "달력 UI, 커스텀 훅, a11y, 테스트까지 확장하며 '실무형' 감각을 다집니다.",
    goals: [
      "월 달력 그리드·공휴일·localStorage 상태 흐름 이해",
      "useFloatingLayer·useMediaQuery·usePagination 패턴 학습",
      "접근성(스킵 링크, aria, axe)과 Vitest 테스트 읽기",
    ],
    concepts: ["calendar grid", "custom hooks", "focus trap", "aria-live", "unit test"],
    readFiles: [
      { path: "src/pages/schedule/Schedule.tsx", hint: "달력 + 사이드패널 레이아웃" },
      { path: "src/lib/schedule/calendarUtils.ts", hint: "날짜 그리드 계산" },
      { path: "src/hooks/useFloatingLayer.ts", hint: "시트·모달 포커스" },
      { path: "src/router/RouteHeadSync.tsx", hint: "title·스크린리더 안내" },
      { path: "src/lib/a11y/formDescribedBy.test.ts", hint: "테스트 예시" },
      { path: "docs/api-request-schedule.md", hint: "localStorage → API 전환 설계" },
    ],
    practice: [
      "일정 등록·수정·삭제 후 localStorage(scheduleItems) 변화 확인",
      "좁은 화면(≤1024px)에서 일정 바텀 시트·포커스 트랩 체험",
      "`yarn test` 실행 후 attachmentAllowlist 테스트 읽기",
      "docs/api-request-schedule.md 보며 API 명세 작성 연습",
    ],
    checkpoints: [
      "MonthCalendar가 기간 일정을 셀에 펼치는 방식을 이해했다",
      "useFloatingLayer의 trapTab·restoreFocus 옵션 의미를 안다",
      "일정 API 명세를 직접 한 엔드포인트라도 써볼 수 있다",
    ],
    tryRoute: "/schedule",
    tryLabel: "일정 페이지 열기",
  },
];

const WEEKLY_PLAN = [
  { week: "1주차", focus: "Phase 0~1", output: "라우트 지도 + 홈/About/레이아웃 코드 읽기 노트" },
  { week: "2주차", focus: "Phase 2", output: "Storybook 2개 스토리 추가 또는 토큰 실험 PR" },
  { week: "3~4주차", focus: "Phase 3", output: "로그인 폼 필드 1개 추가 or 에러 메시지 개선" },
  { week: "5~6주차", focus: "Phase 4", output: "게시판 목록 필터/정렬 흐름 다이어그램 작성" },
  { week: "7주차", focus: "Phase 5", output: "일정 기능 1개 개선 or a11y 이슈 1건 수정" },
] as const;

export default function StudyPlan() {
  const navigate = useNavigate();
  const [openPhase, setOpenPhase] = useState<string | null>("phase-0");

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const togglePhase = (id: string) => {
    setOpenPhase((prev) => (prev === id ? null : id));
  };

  return (
    <div className="study-plan-page">
      <section className="study-plan-hero" aria-labelledby="study-plan-title">
        <PageHeader
          badge="📚 Study Guide"
          title={
            <>
              이 프로젝트로 <span className="gradient-text">React 실전</span> 공부하기
            </>
          }
          titleId="study-plan-title"
          subtitle="화면을 먼저 쓰고, 코드를 따라가고, 작은 수정으로 확인하는 6단계 학습 로드맵입니다. 포트폴리오를 '읽는 법'부터 정리했습니다."
          variant="inline"
          as="div"
        />
        <div className="study-plan-hero__actions">
          <Button variant="primary" size="md" onClick={() => scrollToSection("study-plan-phases")}>
            단계별 계획 보기
          </Button>
          <Button variant="outlinePrimary" size="md" onClick={() => navigate("/style-guide")}>
            스타일 가이드
          </Button>
        </div>
      </section>

      <section className="study-plan-section" aria-labelledby="study-plan-principles-heading">
        <h2 id="study-plan-principles-heading" className="study-plan-section__title">
          학습 원칙
        </h2>
        <ul className="study-plan-principles">
          {PRINCIPLES.map((item) => (
            <li key={item.title}>
              <article className="study-plan-principles__card">
                <span className="study-plan-principles__icon" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="study-plan-principles__title">{item.title}</h3>
                <p className="study-plan-principles__text">{item.text}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="study-plan-section" aria-labelledby="study-plan-map-heading">
        <h2 id="study-plan-map-heading" className="study-plan-section__title">
          주제별 코드 지도
        </h2>
        <p className="study-plan-section__desc">
          막혔을 때 돌아올 참고 표입니다. 한 주제만 골라 관련 파일을 모아 읽으세요.
        </p>
        <div className="study-plan-map">
          <table className="study-plan-map__table">
            <caption className="visually-hidden">주제별 핵심 파일 경로</caption>
            <thead>
              <tr>
                <th scope="col">주제</th>
                <th scope="col">핵심 파일</th>
              </tr>
            </thead>
            <tbody>
              {TOPIC_MAP.map((row) => (
                <tr key={row.topic}>
                  <th scope="row">{row.topic}</th>
                  <td>
                    <code>{row.files}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        id="study-plan-phases"
        className="study-plan-section"
        aria-labelledby="study-plan-phases-heading"
      >
        <h2 id="study-plan-phases-heading" className="study-plan-section__title">
          6단계 학습 계획
        </h2>
        <p className="study-plan-section__desc">
          총 6~8주 분량(하루 1~2시간 기준). 각 단계를 펼쳐 읽을 파일·실습·체크포인트를 확인하세요.
        </p>
        <ol className="study-plan-phases">
          {STUDY_PHASES.map((phase) => {
            const isOpen = openPhase === phase.id;
            const panelId = `${phase.id}-panel`;
            const triggerId = `${phase.id}-trigger`;

            return (
              <li key={phase.id} className="study-plan-phase">
                <h3 className="study-plan-phase__heading">
                  <button
                    id={triggerId}
                    type="button"
                    className="study-plan-phase__trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => togglePhase(phase.id)}
                  >
                    <span className="study-plan-phase__badge">{phase.phase}</span>
                    <span className="study-plan-phase__title-wrap">
                      <span className="study-plan-phase__title">{phase.title}</span>
                      <span className="study-plan-phase__meta">
                        {phase.duration} · {phase.summary}
                      </span>
                    </span>
                    <span className="study-plan-phase__chevron" aria-hidden>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className={`study-plan-phase__panel${isOpen ? " study-plan-phase__panel--open" : ""}`}
                  hidden={!isOpen}
                >
                  <div className="study-plan-phase__grid">
                    <div className="study-plan-phase__block">
                      <h4 className="study-plan-phase__label">목표</h4>
                      <ul>
                        {phase.goals.map((goal) => (
                          <li key={goal}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="study-plan-phase__block">
                      <h4 className="study-plan-phase__label">배울 개념</h4>
                      <ul className="study-plan-phase__tags">
                        {phase.concepts.map((concept) => (
                          <li key={concept}>
                            <span>{concept}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="study-plan-phase__block study-plan-phase__block--wide">
                      <h4 className="study-plan-phase__label">읽을 코드</h4>
                      <ul className="study-plan-phase__files">
                        {phase.readFiles.map((file) => (
                          <li key={file.path}>
                            <code>{file.path}</code>
                            <span>{file.hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="study-plan-phase__block">
                      <h4 className="study-plan-phase__label">실습</h4>
                      <ul>
                        {phase.practice.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="study-plan-phase__block">
                      <h4 className="study-plan-phase__label">체크포인트</h4>
                      <ul className="study-plan-phase__checks">
                        {phase.checkpoints.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {phase.tryRoute ? (
                    <div className="study-plan-phase__cta">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(phase.tryRoute!)}
                      >
                        {phase.tryLabel}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="study-plan-section" aria-labelledby="study-plan-weekly-heading">
        <h2 id="study-plan-weekly-heading" className="study-plan-section__title">
          주차별 추천 페이스
        </h2>
        <ol className="study-plan-weekly">
          {WEEKLY_PLAN.map((item) => (
            <li key={item.week} className="study-plan-weekly__item">
              <span className="study-plan-weekly__week">{item.week}</span>
              <span className="study-plan-weekly__focus">{item.focus}</span>
              <span className="study-plan-weekly__output">{item.output}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="study-plan-cta" aria-labelledby="study-plan-cta-heading">
        <div className="study-plan-cta__card">
          <h2 id="study-plan-cta-heading" className="study-plan-cta__title">
            Phase 0부터 시작하기
          </h2>
          <p className="study-plan-cta__text">
            README와 About을 읽은 뒤, 로그인 없이 둘러볼 수 있는 화면부터 열어보세요.
          </p>
          <div className="study-plan-cta__buttons">
            <Button variant="primaryInverse" onClick={() => navigate("/about")}>
              프로젝트 소개
            </Button>
            <Button variant="secondaryInverse" onClick={() => navigate("/post/list")}>
              게시판
            </Button>
            <Button variant="secondaryInverse" onClick={() => navigate("/user/list")}>
              사용자 목록 (mock)
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
