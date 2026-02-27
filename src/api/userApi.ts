import { MOCK_USERS } from "@/mocks/user";

export type UserItem = {
  userFlnm: string;
  userJbgdNm: string;
  eml: string;
  userSe: string;
};

type SelectUserListParams = {
  page: number;
  size: number;
};

/** 사용자 목록 — common/api 제거 후 목 데이터로 대체 (의존성 제거) */
export async function selectUserList({ page, size }: SelectUserListParams) {
  const start = (page - 1) * size;
  const data = MOCK_USERS.slice(start, start + size);
  return {
    data: {
      data,
      totalItemSize: MOCK_USERS.length,
      itemSize: data.length,
      pageSize: size,
    },
  };
}