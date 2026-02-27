export type BoardPostItem = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  viewCount: number;
  category: string;
};

const CATEGORIES = ["공지", "일반", "질문", "자유"] as const;
const AUTHORS = [
  "홍길동", "김수지", "이민준", "박서연", "최지우", "정예진", "강도윤", "조현우",
  "윤서아", "장민서", "임준혁", "한지민", "오세훈", "신유나", "권지훈", "송하늘",
];

const TITLES = [
  "프로젝트 환경 설정 가이드",
  "React Hook 사용 시 주의사항",
  "TypeScript 타입 추론 정리",
  "다크 모드 적용 방법",
  "API 연동 시 CORS 해결",
  "배포 후 이슈 정리",
  "코드 리뷰 요청드립니다",
  "스타일 가이드 제안",
  "성능 개선 아이디어 공유",
  "새 기능 제안: 알림 기능",
  "버그 리포트: 로그인 시도 시",
  "문서화 관련 논의",
  "테스트 커버리지 목표",
  "컴포넌트 구조 개선 제안",
  "접근성(a11y) 체크리스트",
  "번들 사이즈 최적화 후기",
  "팀 미팅 일정 공유",
  "주간 회고 요약",
  "라이브러리 업데이트 공지",
  "이벤트 참가 신청 안내",
];

function buildMockPosts(): BoardPostItem[] {
  return Array.from({ length: 48 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i % 90));
    const createdAt = d.toISOString().slice(0, 10);
    return {
      id: i + 1,
      title: TITLES[i % TITLES.length] + (i >= TITLES.length ? ` (${i + 1})` : ""),
      author: AUTHORS[i % AUTHORS.length],
      createdAt,
      viewCount: (i % 500) + 10,
      category: CATEGORIES[i % CATEGORIES.length],
    };
  });
}

export const MOCK_BOARD_POSTS: BoardPostItem[] = buildMockPosts();
