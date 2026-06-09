import { useCallback, useEffect, useMemo, useState } from "react";
import { COMMENT_SUCCESS_CODE, createComment, selectCommentList } from "@/api/board";
import type { CommentListItem } from "@/api/board/boardApi.types";
import { Button } from "@/components";
import { SecretCommentLockIcon } from "@/components/icons/SecretCommentLockIcon";
import { canViewSecretCommentBody } from "@/lib/comment/canViewSecretCommentBody";
import { CommentRow } from "@/pages/post/components/CommentRow";
import "@/pages/post/components/CommentSection.scss";

type CommentSectionProps = {
  postNumber: number;
  postOwnerUserId?: string;
};

type CommentFlatRow = {
  id: string;
  author: string;
  dateLabel: string;
  body: string;
  likes: number;
  dislikes: number;
  isSecret?: boolean;
  isDeleted?: boolean;
  authorUserId?: string;
  parentId: string | null;
};

type CommentTreeNode = CommentFlatRow & { replies: CommentTreeNode[] };

function flatRowsToTrees(rows: readonly CommentFlatRow[]): CommentTreeNode[] {
  const roots: CommentTreeNode[] = [];
  const map = new Map<string, CommentTreeNode>();

  for (const row of rows) {
    const node: CommentTreeNode = { ...row, replies: [] };
    map.set(row.id, node);
    if (row.parentId == null) {
      roots.push(node);
    } else {
      const parent = map.get(row.parentId);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
  }

  return roots;
}

function formatCommentDateLabel(regDt: string) {
  return regDt.slice(0, 10);
}

function toParentId(parentCommentId: number | null) {
  if (parentCommentId == null || parentCommentId === 0) return null;
  return String(parentCommentId);
}

function mapCommentListItemToFlatRow(item: CommentListItem): CommentFlatRow {
  const isDeleted = item.delYn === "Y";
  const isSecret = item.secretYn === "Y";

  return {
    id: String(item.commentId),
    author: item.rgtrName,
    dateLabel: formatCommentDateLabel(item.regDt),
    body: isDeleted ? "" : item.content,
    likes: item.likeCnt,
    dislikes: item.dislikeCnt,
    isSecret,
    isDeleted,
    authorUserId: item.rgtrId,
    parentId: toParentId(item.parentCommentId),
  };
}

function avatarInitial(name: string) {
  const t = name.trim();
  return t ? t[0]! : "?";
}

function resolveCanViewSecretBody(
  comment: Pick<CommentFlatRow, "isSecret" | "authorUserId">,
  currentUserId: string | null,
  postOwnerUserId?: string,
) {
  return canViewSecretCommentBody({
    isSecret: comment.isSecret,
    commentAuthorUserId: comment.authorUserId,
    currentUserId,
    postOwnerUserId,
  });
}

// 게시글 상세 댓글 영역 — GET /comments 목록 + POST /comments 작성
export default function CommentSection({ postNumber, postOwnerUserId }: CommentSectionProps) {
  const [apiRows, setApiRows] = useState<CommentFlatRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialListReady, setIsInitialListReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [isSecretComment, setIsSecretComment] = useState(false);
  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const commentTrees = useMemo(() => flatRowsToTrees(apiRows), [apiRows]);

  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadComments = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setIsInitialListReady(false);
      try {
        const items = await selectCommentList({ postNumber });
        if (signal?.aborted) return;

        if (!items) {
          if (!signal?.aborted) setInitialError("댓글을 불러오지 못했습니다.");
          return;
        }

        const rows = items.map(mapCommentListItemToFlatRow);
        setInitialError(null);
        setApiRows(rows);
        setTotalCount(rows.length);
      } catch {
        if (!signal?.aborted) setInitialError("댓글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
        if (!signal?.aborted) setIsInitialListReady(true);
      }
    },
    [postNumber],
  );

  const handleSubmit = async () => {
    const content = draft.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await createComment({
        postNumber,
        content,
        parentCommentId: null,
        rootCommentId: null,
        depth: 0,
        secretYn: isSecretComment ? "Y" : "N",
      });

      if (!res) return;

      if (res.resultCode !== COMMENT_SUCCESS_CODE) {
        setSubmitError(
          res.resultMessage ?? res.resultDetailMessage ?? "댓글 등록에 실패했습니다.",
        );
        return;
      }

      setDraft("");
      setIsSecretComment(false);
      await loadComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    queueMicrotask(() => {
      if (ac.signal.aborted) return;
      void loadComments(ac.signal);
    });
    return () => ac.abort();
  }, [loadComments]);

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
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (submitError) setSubmitError(null);
            }}
            disabled={isSubmitting || !isInitialListReady}
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
                disabled={isSubmitting || !isInitialListReady}
              >
                <SecretCommentLockIcon locked={isSecretComment} className="comment-section__secret-lock-icon" />
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="comment-section__composer-submit"
                disabled={isSubmitting || !isInitialListReady || draft.trim().length === 0}
                onClick={handleSubmit}
              >
                {isSubmitting ? "등록 중..." : !isInitialListReady ? "불러오는 중..." : "등록"}
              </Button>
            </div>
          </div>
          {submitError ? (
            <p className="comment-section__composer-error" role="alert">
              {submitError}
            </p>
          ) : null}
        </div>
      </div>

      {initialError && apiRows.length === 0 ? (
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
                    isDeleted={comment.isDeleted}
                  />

                  {comment.replies.length > 0 ? (
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
                            isDeleted={reply.isDeleted}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <div className="comment-section__infinite-status" aria-live="polite">
            {isLoading ? <span className="comment-section__infinite-loading">댓글 불러오는 중…</span> : null}
            {!isLoading && isInitialListReady && apiRows.length > 0 ? (
              <span className="comment-section__infinite-end">모든 댓글을 불러왔습니다.</span>
            ) : null}
            {!isLoading && isInitialListReady && apiRows.length === 0 ? (
              <span className="comment-section__infinite-end">등록된 댓글이 없습니다.</span>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
