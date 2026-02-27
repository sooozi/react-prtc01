import type { UserItem } from "@/api/userApi";

const POSITIONS = ["사원", "대리", "과장", "차장", "부장"] as const;
const USER_SE = ["사용자", "관리자"] as const;

const NAMES = [
  "홍길동", "김수지", "김애순", "이민준", "박서연", "최지우", "정예진", "강도윤",
  "조현우", "윤서아", "장민서", "임준혁", "한지민", "오세훈", "신유나", "권지훈",
  "송하늘", "배성민", "황예린", "서준영", "문지현", "양동현", "백수아", "남궁민",
  "사공준", "허소희", "전미래", "표영수", "노가을", "도현석", "마서준", "구민재",
  "우지훈", "라미영", "진태윤", "엄소율", "변지호", "석수빈", "선우재민", "설하은",
  "채은서", "태윤호", "편도훈", "피지원", "하승민", "곽시우", "봉민지", "사유나",
  "안준서", "어도윤", "유서현", "은지원", "인준호", "제이준", "차민규", "채윤아",
  "평지훈", "함소윤",
];

function buildMockUsers(): UserItem[] {
  return NAMES.map((name, i) => ({
    userFlnm: name,
    userJbgdNm: POSITIONS[i % POSITIONS.length],
    eml: `user${i + 1}@test.com`,
    userSe: USER_SE[i % 2],
  }));
}

export const MOCK_USERS: UserItem[] = buildMockUsers();
