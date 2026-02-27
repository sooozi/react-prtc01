import { MOCK_BOARD_POSTS } from "@/mocks/board";

export type BoardPostItem = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  viewCount: number;
  category: string;
};

type SelectBoardListParams = {
  page: number;
  size: number;
};

export async function selectBoardList({ page, size }: SelectBoardListParams) {
  const start = (page - 1) * size;
  const data = MOCK_BOARD_POSTS.slice(start, start + size);
  return {
    data: {
      data,
      totalItemSize: MOCK_BOARD_POSTS.length,
      itemSize: data.length,
      pageSize: size,
    },
  };
}
