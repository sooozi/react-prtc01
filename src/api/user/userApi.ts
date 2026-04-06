import { MOCK_USERS } from "@/mocks/user";

export type UserItem = {
  userId: string;
  userFlnm: string;
  userJbgdNm: string;
  eml: string;
  userSe: string;
};

type SelectUserListParams = {
  page: number;
  size: number;
};

/**
 * 사용자 목록 (목 데이터 사용)
 * - common/api(8082) 호출부 제거 요구에 따라 해당 의존성 제거 완료
 * - BPLTE core(8081) Swagger에는 사용자 목록 API가 없어 목 데이터 사용
 */
export async function selectUserList({ page, size }: SelectUserListParams) {
  const start = (page - 1) * size; // 이번 페이지에 해당하는 데이터가 배열에서 어디부터 잘라야 하는지
  const data = MOCK_USERS.slice(start, start + size); // 이번 페이지에 해당하는 데이터를 잘라서 반환
  return {
    data: {
      data,
      totalItemSize: MOCK_USERS.length,
      itemSize: data.length,
      pageSize: size,
    },
  };
}

/**
 * 사용자 상세 (목 데이터 — userId 일치 행)
 */
export async function selectUserDetail(userId: string): Promise<UserItem | null> {
  const id = userId.trim();
  if (!id) return null;
  const user = MOCK_USERS.find((u) => u.userId === id);
  return user ?? null;
}
