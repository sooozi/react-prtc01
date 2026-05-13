import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components";
import { SecretCommentLockIcon } from "@/components/icons/SecretCommentLockIcon";
import { PostCommentRow } from "@/pages/post/PostCommentRow";
import { countPreviewComments, PREVIEW_COMMENTS, type PreviewComment } from "@/pages/post/postCommentMockData";
import "@/pages/post/PostCommentSection.scss";

// API 한 행(댓글·대댓글 공통) — 무한 스크롤은 플랫 단위로 페이지네이션
type CommentFlatRow = Omit<PreviewComment, "replies"> & { parentId: string | null };

// 한 번의 목록 요청에 가져올 플랫 행 수(댓글+대댓글 합산)
const COMMENT_PAGE_SIZE = 5;

// 목 API 지연(ms) — 무한 스크롤 테스트
const MOCK_COMMENT_FETCH_DELAY_MS = 500;

// DFS: 답글 및 대댓글 한 파트 → 옆 댓글. 한 줄로 자르고 트리로 돌릴 때 순서 유지
// nodes: 지금 단계에서 처리할 댓글 배열, parentId: 부모 댓글 ID, out: 결과 배열
function flattenCommentsDFS(nodes: readonly PreviewComment[], parentId: string | null, out: CommentFlatRow[]) {
  for (const n of nodes) {
    const { replies, ...leaf } = n; // 답글 및 대댓글 제외한 댓글 정보
    out.push({ ...leaf, parentId }); // 플랫 배열에 추가(한 줄로 쭉 이어진 배열)
    if (replies?.length) flattenCommentsDFS(replies, n.id, out); // 답글 및 대댓글 재귀 처리
  } // 모든 댓글 처리 완료
}

// 모든 댓글 플랫 배열
const ALL_COMMENTS_FLAT: CommentFlatRow[] = [];
flattenCommentsDFS(PREVIEW_COMMENTS, null, ALL_COMMENTS_FLAT);

// 누적 플랫 행 → 렌더용 트리 (행 순서대로 부모가 먼저 와야 함)
function flatRowsToTrees(rows: readonly CommentFlatRow[]): PreviewComment[] {
  const roots: PreviewComment[] = [];
  const map = new Map<string, PreviewComment & { replies: PreviewComment[] }>();

  for (const row of rows) {
    const { parentId, ...leaf } = row;
    const node: PreviewComment & { replies: PreviewComment[] } = { ...leaf, replies: [] };
    map.set(row.id, node);
    if (parentId == null) {
      roots.push(node);
    } else {
      const parent = map.get(parentId);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
  }

  return roots;
}

// 네트워크 대체: offset 기준 COMMENT_PAGE_SIZE개 반환
function fetchCommentsPageMock(offset: number): Promise<{ rows: CommentFlatRow[]; hasMore: boolean }> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const rows = ALL_COMMENTS_FLAT.slice(offset, offset + COMMENT_PAGE_SIZE); // 플랫 배열에서 현재 페이지 행 추출
      const hasMore = offset + rows.length < ALL_COMMENTS_FLAT.length; // 더 불러올 행이 있는지 확인  
      resolve({ rows, hasMore }); // 결과 반환
    }, MOCK_COMMENT_FETCH_DELAY_MS);
  });
}

// 이름 첫 글자 추출
function avatarInitial(name: string) {
  const t = name.trim();
  return t ? t[0]! : "?";
}

// 게시글 상세 댓글 영역 — 플랫 5개 단위 무한 스크롤(목 API), 이후 실 API로 교체
export default function PostCommentSection() {
  const totalCount = countPreviewComments(PREVIEW_COMMENTS);
  const [loadedRows, setLoadedRows] = useState<CommentFlatRow[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSecretComment, setIsSecretComment] = useState(false);

  const commentTrees = useMemo(() => flatRowsToTrees(loadedRows), [loadedRows]);

  // 무한 스크롤 로드 기능
  const loadPage = useCallback(async (offset: number, append: boolean, signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const { rows, hasMore: more } = await fetchCommentsPageMock(offset);
      if (signal?.aborted) return;
      setInitialError(null);
      setLoadedRows((prev) => (append ? [...prev, ...rows] : rows));
      setNextOffset(offset + rows.length);
      setHasMore(more);
    } catch {
      if (!append && !signal?.aborted) setInitialError("댓글을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 마운트 시 첫 페이지만 요청(언마운트·재실행 시 이전 요청 취소)
  useEffect(() => {
    const ac = new AbortController();
    void loadPage(0, false, ac.signal);
    return () => ac.abort();
  }, [loadPage]);

  // 다음 페이지 이어 붙이기
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    void loadPage(nextOffset, true);
  }, [hasMore, isLoading, loadPage, nextOffset]);

  // 하단 센티널이 보이면 다음 페이지 로드
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) loadMore();
      },
      { root: null, rootMargin: "0px", threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  return (
    <section className="post-comment-section" aria-labelledby="post-comment-heading">
      <div className="post-comment-section__page-head">
        <h2 id="post-comment-heading" className="post-comment-section__heading">
          댓글
          <span className="post-comment-section__count">{totalCount}</span>
        </h2>
        <div className="post-comment-section__sort">
          <label htmlFor="post-comment-sort" className="visually-hidden">
            정렬
          </label>
          <select id="post-comment-sort" className="post-comment-section__select" defaultValue="recent" disabled>
            <option value="recent">최신순</option>
            <option value="old">오래된순</option>
          </select>
        </div>
      </div>

      <div className="post-comment-section__write-block">
        <h3 id="post-comment-write-heading" className="post-comment-section__subheading">
          댓글 작성
        </h3>
        <div className="post-comment-section__composer-card" aria-labelledby="post-comment-write-heading">
          <label htmlFor="post-comment-draft" className="visually-hidden">
            댓글 입력
          </label>
          <textarea
            id="post-comment-draft"
            className="post-comment-section__draft"
            rows={5}
            placeholder="댓글을 입력하세요."
          />
          <div className="post-comment-section__composer-foot">
            <div className="post-comment-section__composer-actions">
              <Button
                type="button"
                variant="outlinePrimary"
                size="sm"
                aria-pressed={isSecretComment}
                aria-label={isSecretComment ? "비밀 댓글 켜짐" : "비밀 댓글 꺼짐"}
                className={
                  isSecretComment
                    ? "post-comment-section__secret-comment-btn post-comment-section__secret-comment-btn--on"
                    : "post-comment-section__secret-comment-btn"
                }
                onClick={() => {
                  setIsSecretComment((prev) => {
                    const next = !prev;
                    console.log("[댓글 작성] 비밀댓글:", next);
                    return next;
                  });
                }}
              >
                <SecretCommentLockIcon locked={isSecretComment} className="post-comment-section__secret-lock-icon" />
              </Button>
              <Button type="button" variant="primary" size="sm" className="post-comment-section__composer-submit" disabled>
                등록
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 첫 페이지 로드 실패 시 에러 메시지 표시 */}
      {initialError && loadedRows.length === 0 ? (
        <p className="post-comment-section__list-error" role="alert">
          {initialError}
        </p>
      ) : (
        <>
          <ul className="post-comment-section__list" aria-label="댓글 목록">
            {commentTrees.map((comment) => (
              <li key={comment.id} className="post-comment-section__root">
                <div className="post-comment-section__root-thread">
                  <PostCommentRow
                    variant="root"
                    avatarLetter={avatarInitial(comment.author)}
                    commentKey={comment.id}
                    author={comment.author}
                    dateLabel={comment.dateLabel}
                    body={comment.body}
                    likes={comment.likes}
                    dislikes={comment.dislikes}
                  />

                  {comment.replies && comment.replies.length > 0 ? (
                    <ul className="post-comment-section__replies" aria-label="답글">
                      {comment.replies.map((reply) => (
                        <li key={reply.id} className="post-comment-section__reply">
                          <PostCommentRow
                            variant="reply"
                            avatarLetter={avatarInitial(reply.author)}
                            commentKey={reply.id}
                            author={reply.author}
                            dateLabel={reply.dateLabel}
                            body={reply.body}
                            likes={reply.likes}
                            dislikes={reply.dislikes}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <div ref={sentinelRef} className="post-comment-section__scroll-sentinel" aria-hidden />

          <div className="post-comment-section__infinite-status" aria-live="polite">
            {isLoading ? <span className="post-comment-section__infinite-loading">댓글 불러오는 중…</span> : null}
            {!hasMore && loadedRows.length > 0 ? (
              <span className="post-comment-section__infinite-end">모든 댓글을 불러왔습니다.</span>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
