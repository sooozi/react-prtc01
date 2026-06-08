import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components";
import { SecretCommentLockIcon } from "@/components/icons/SecretCommentLockIcon";
import { canViewSecretCommentBody } from "@/lib/comment/canViewSecretCommentBody";
import { CommentRow } from "@/pages/post/components/CommentRow";
import { countPreviewComments, PREVIEW_COMMENTS, type PreviewComment } from "@/mocks/comment";
import "@/pages/post/components/CommentSection.scss";

type CommentSectionProps = {
  postOwnerUserId?: string;
};

// API 한 행(댓글·대댓글 공통) — 무한 스크롤은 플랫 단위로 페이지네이션
type CommentFlatRow = Omit<PreviewComment, "replies"> & { parentId: string | null };

// 한 번의 목록 요청에 가져올 플랫 행 수(댓글+대댓글 합산)
const COMMENT_PAGE_SIZE = 5;

// 목 API 지연(ms) — 무한 스크롤 테스트
const MOCK_COMMENT_FETCH_DELAY_MS = 500;

// 목 UI: 첫 댓글의 첫 대댓글은 항상 비밀댓글 잠금 상태로 미리보기
const MOCK_SECRET_PREVIEW_COMMENT_ID = "mock-1-reply-1";

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

function resolveCanViewSecretBody(
  comment: Pick<PreviewComment, "id" | "isSecret" | "authorUserId">,
  currentUserId: string | null,
  postOwnerUserId?: string,
) {
  if (comment.id === MOCK_SECRET_PREVIEW_COMMENT_ID && comment.isSecret) {
    return false;
  }
  return canViewSecretCommentBody({
    isSecret: comment.isSecret,
    commentAuthorUserId: comment.authorUserId,
    currentUserId,
    postOwnerUserId,
  });
}

// 게시글 상세 댓글 영역 — 플랫 5개 단위 무한 스크롤(목 API), 이후 실 API로 교체
export default function CommentSection({ postOwnerUserId }: CommentSectionProps) {
  const totalCount = countPreviewComments(PREVIEW_COMMENTS);
  const [loadedRows, setLoadedRows] = useState<CommentFlatRow[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSecretComment, setIsSecretComment] = useState(false);
  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

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
    // eslint-plugin-react-hooks의 set-state-in-effect 규칙을 만족시키기 위해,
    // effect 본문에서 직접 setState를 유발하는 비동기 호출을 즉시 실행하지 않고 마이크로태스크로 분리.
    queueMicrotask(() => {
      if (ac.signal.aborted) return;
      void loadPage(0, false, ac.signal);
    });
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
    <section className="comment-section" aria-labelledby="comment-heading">
      <div className="comment-section__page-head">
        <h3 id="comment-heading" className="comment-section__heading">
          댓글
          <span className="comment-section__count">{totalCount}</span>
        </h3>
        <div className="comment-section__sort">
          <label htmlFor="comment-sort" className="visually-hidden">
            정렬
          </label>
          <select id="comment-sort" className="comment-section__select" defaultValue="recent" disabled>
            <option value="recent">최신순</option>
            <option value="old">오래된순</option>
          </select>
        </div>
      </div>

      <div className="comment-section__write-block">
        <h4 id="comment-write-heading" className="comment-section__subheading">
          댓글 작성
        </h4>
        <div className="comment-section__composer-card" aria-labelledby="comment-write-heading">
          <label htmlFor="comment-draft" className="visually-hidden">
            댓글 입력
          </label>
          <textarea
            id="comment-draft"
            className="comment-section__draft"
            rows={5}
            placeholder="댓글을 입력하세요."
          />
          <div className="comment-section__composer-foot">
            <div className="comment-section__composer-actions">
              <Button
                type="button"
                variant="outlinePrimary"
                size="sm"
                aria-pressed={isSecretComment}
                aria-label={isSecretComment ? "비밀 댓글 켜짐" : "비밀 댓글 꺼짐"}
                className={
                  isSecretComment
                    ? "comment-section__secret-comment-btn comment-section__secret-comment-btn--on"
                    : "comment-section__secret-comment-btn"
                }
                onClick={() => setIsSecretComment((prev) => !prev)}
              >
                <SecretCommentLockIcon locked={isSecretComment} className="comment-section__secret-lock-icon" />
              </Button>
              <Button type="button" variant="primary" size="sm" className="comment-section__composer-submit" disabled>
                등록
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 첫 페이지 로드 실패 시 에러 메시지 표시 */}
      {initialError && loadedRows.length === 0 ? (
        <p className="comment-section__list-error" role="alert">
          {initialError}
        </p>
      ) : (
        <>
          <ul className="comment-section__list" aria-label="댓글 목록">
            {commentTrees.map((comment) => (
              <li key={comment.id} className="comment-section__root">
                <div className="comment-section__root-thread">
                  <CommentRow
                    variant="root"
                    avatarLetter={avatarInitial(comment.author)}
                    commentKey={comment.id}
                    author={comment.author}
                    dateLabel={comment.dateLabel}
                    body={comment.body}
                    likes={comment.likes}
                    dislikes={comment.dislikes}
                    isSecret={comment.isSecret}
                    canViewSecretBody={resolveCanViewSecretBody(comment, currentUserId, postOwnerUserId)}
                  />

                  {comment.replies && comment.replies.length > 0 ? (
                    <ul className="comment-section__replies" aria-label="답글">
                      {comment.replies.map((reply) => (
                        <li key={reply.id} className="comment-section__reply">
                          <CommentRow
                            variant="reply"
                            avatarLetter={avatarInitial(reply.author)}
                            commentKey={reply.id}
                            author={reply.author}
                            dateLabel={reply.dateLabel}
                            body={reply.body}
                            likes={reply.likes}
                            dislikes={reply.dislikes}
                            isSecret={reply.isSecret}
                            canViewSecretBody={resolveCanViewSecretBody(reply, currentUserId, postOwnerUserId)}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <div ref={sentinelRef} className="comment-section__scroll-sentinel" aria-hidden />

          <div className="comment-section__infinite-status" aria-live="polite">
            {isLoading ? <span className="comment-section__infinite-loading">댓글 불러오는 중…</span> : null}
            {!hasMore && loadedRows.length > 0 ? (
              <span className="comment-section__infinite-end">모든 댓글을 불러왔습니다.</span>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
