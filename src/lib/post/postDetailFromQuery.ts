/** URL 쿼리 `from` — 허용 값만 (오픈 리다이렉트 방지) */
export type PostDetailFromParam = "mypage" | "list";

// from 쿼리 값을 경로로 변환
export function listReturnPathFromFromQuery(from: string | null): "/post/list" | "/user/mypage" {
  return from === "mypage" ? "/user/mypage" : "/post/list";
}

// from 쿼리 값을 정규화
export function normalizedPostDetailFrom(from: string | null): PostDetailFromParam | null {
  return from === "mypage" || from === "list" ? from : null;
}

// 게시글 상세 경로 생성
export function postDetailPath(postNumber: number, from: string | null): string {
  const q = new URLSearchParams({ id: String(postNumber) });
  const n = normalizedPostDetailFrom(from);
  if (n) q.set("from", n);
  return `/post/detail?${q.toString()}`;
}

// 게시글 수정 경로 생성
export function postUpdatePath(postNumber: number, from: string | null): string {
  const q = new URLSearchParams({ id: String(postNumber) });
  const n = normalizedPostDetailFrom(from);
  if (n) q.set("from", n);
  return `/post/update?${q.toString()}`;
}