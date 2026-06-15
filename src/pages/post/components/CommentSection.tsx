import { useCallback, useEffect, useMemo, useState } from "react";
import {
  COMMENT_SUCCESS_CODE,
  createComment,
  deleteComment,
  selectCommentList,
  updateComment,
  reactToComment,
} from "@/api/board";
import type {
  CommentListItem,
  CommentReactionType,
  CommentUserReaction,
} from "@/api/board/boardApi.types";
import { Button } from "@/components";
import { SecretCommentLockIcon } from "@/components/icons/SecretCommentLockIcon";
import { canViewSecretCommentBody } from "@/lib/comment/canViewSecretCommentBody";
import { buildRootCommentRequest, isRootComment } from "@/lib/comment/buildCreateCommentRequest";
import {
  resolveCommentMyReaction,
  resolveMyReactionAfterRequest,
} from "@/lib/comment/resolveCommentMyReaction";
import { CommentRow } from "@/pages/post/components/CommentRow";
import "@/pages/post/components/CommentSection.scss";

type CommentSectionProps = {
  postNumber: number;
  postOwnerUserId?: string;
};

type CommentTreeNode = CommentListItem & { replies: CommentTreeNode[] };

// 댓글 정렬
function compareCommentsNewestFirst(a: CommentListItem, b: CommentListItem) {
  const byDate = b.regDt.localeCompare(a.regDt);
  return byDate !== 0 ? byDate : b.commentId - a.commentId;
}

// 댓글 정렬
function compareCommentsOldestFirst(a: CommentListItem, b: CommentListItem) {
  const byDate = a.regDt.localeCompare(b.regDt);
  return byDate !== 0 ? byDate : a.commentId - b.commentId;
}

// 댓글 트리 구축
function flatRowsToTrees(rows: readonly CommentListItem[]): CommentTreeNode[] {
  const roots: CommentTreeNode[] = [];
  const map = new Map<number, CommentTreeNode>();

  for (const row of rows) {
    const node: CommentTreeNode = { ...row, replies: [] };
    map.set(row.commentId, node);
    if (isRootComment(row.parentCommentId)) {
      roots.push(node);
    } else {
      const parent = map.get(row.parentCommentId!);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
  }

  roots.sort(compareCommentsNewestFirst);
  for (const root of roots) {
    root.replies.sort(compareCommentsOldestFirst);
  }

  return roots;
}

function resolveCanViewSecretBody(
  comment: Pick<CommentListItem, "secretYn" | "rgtrId">,
  currentUserId: string | null,
  postOwnerUserId?: string,
) {
  return canViewSecretCommentBody({
    secretYn: comment.secretYn,
    rgtrId: comment.rgtrId,
    currentUserId,
    postOwnerUserId,
  });
}

// 게시글 상세 댓글 영역 — GET /comments 목록 + POST /comments 작성
export default function CommentSection({ postNumber, postOwnerUserId }: CommentSectionProps) {
  const [apiRows, setApiRows] = useState<CommentListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialListReady, setIsInitialListReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [isSecretComment, setIsSecretComment] = useState(false);
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const commentTrees = useMemo(() => flatRowsToTrees(apiRows), [apiRows]);

  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null); // 삭제 중인 댓글 ID
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null); // 수정 중인 댓글 ID

  const [savingCommentId, setSavingCommentId] = useState<number | null>(null); // 추가
  const [editError, setEditError] = useState<string | null>(null); // 추가 (선택)

  const [reactingCommentId, setReactingCommentId] = useState<number | null>(null);
  const [myReactionByCommentId, setMyReactionByCommentId] = useState<
    Record<number, CommentUserReaction | null>
  >({});

  function syncMyReactionsFromRows(rows: readonly CommentListItem[]) {
    setMyReactionByCommentId((prev) => {
      const next = { ...prev };
      for (const row of rows) {
        const hasServerReactionField =
          row.myReactionType !== undefined || row.reactionType !== undefined;
        if (hasServerReactionField) {
          next[row.commentId] = resolveCommentMyReaction(row);
        } else if (!(row.commentId in next)) {
          next[row.commentId] = null;
        }
      }
      return next;
    });
  }

  function getMyReaction(commentId: number, rows: readonly CommentListItem[]) {
    if (commentId in myReactionByCommentId) {
      return myReactionByCommentId[commentId] ?? null;
    }
    const row = rows.find((item) => item.commentId === commentId);
    return row ? resolveCommentMyReaction(row) : null;
  }

  // 댓글 목록 불러오기
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

        setInitialError(null);
        setApiRows(items);
        setTotalCount(items.length);
        syncMyReactionsFromRows(items);
      } catch {
        if (!signal?.aborted) setInitialError("댓글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
        if (!signal?.aborted) setIsInitialListReady(true);
      }
    },
    [postNumber],
  );

  // 댓글 소유 여부 확인
  const isOwnComment = useCallback(
    (rgtrId: string) => !!currentUserId && rgtrId === currentUserId,
    [currentUserId],
  );

  // 댓글 수정
  const handleStartEdit = (commentId: number) => {
    if (deletingCommentId != null || savingCommentId != null) return;
    setEditError(null);
    setEditingCommentId(commentId);
  };

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null); // 수정 중인 댓글 ID 초기화
    setEditError(null); // 수정 오류 메시지 초기화
    setSavingCommentId(null); // 수정 중 여부 초기화
  };

  // 댓글 수정
  const handleSaveEdit = async (commentId: number, content: string) => {
    const trimmed = content.trim();
    if (!trimmed || savingCommentId != null) return;
    setSavingCommentId(commentId);
    setEditError(null);
    try {
      const res = await updateComment(commentId, { content: trimmed });
      if (!res) return; // 네트워크/토큰 오류 → reportApiErrorToUser가 이미 처리
      if (res.resultCode !== COMMENT_SUCCESS_CODE) {
        setEditError(res.resultMessage ?? res.resultDetailMessage ?? "댓글 수정에 실패했습니다.");
        return;
      }
      setEditingCommentId(null);
      await loadComments(); // 목록 새로고침 → 화면에 수정된 내용 반영
    } finally {
      setSavingCommentId(null);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (deletingCommentId != null) return;

    setDeletingCommentId(commentId);
    try {
      const ok = await deleteComment(commentId);
      if (ok) {
        if (editingCommentId === commentId) setEditingCommentId(null);
        await loadComments();
      }
    } finally {
      setDeletingCommentId(null);
    }
  };

  // 댓글 등록
  const handleSubmit = async () => {
    const content = draft.trim(); // 댓글 내용 양쪽 공백 제거
    if (!content || isSubmitting) return;

    setIsSubmitting(true); // 등록 API 호출 중 여부 표시
    setSubmitError(null); // 등록 오류 메시지 초기화

    try {
      // 댓글 등록 API 호출
      const res = await createComment(
        buildRootCommentRequest(postNumber, content, isSecretComment ? "Y" : "N"),
      );

      if (!res) return;

      // 등록 성공 → 목록 새로고침 → 화면에 등록된 내용 반영
      if (res.resultCode !== COMMENT_SUCCESS_CODE) {
        // 등록 실패 → 등록 오류 메시지 표시
        setSubmitError(res.resultMessage ?? res.resultDetailMessage ?? "댓글 등록에 실패했습니다.");
        return;
      }

      setDraft(""); // 댓글 내용 초기화
      setIsSecretComment(false); // 비밀 댓글 꺼짐
      await loadComments(); // 목록 새로고침 → 화면에 등록된 내용 반영
    } finally {
      setIsSubmitting(false); // 등록 API 호출 중 여부 초기화
    }
  };

  // 댓글 반응
  const handleReaction = async (commentId: number, reactionType: CommentReactionType) => {
    if (reactingCommentId != null) return;

    setReactingCommentId(commentId);
    try {
      const res = await reactToComment(commentId, reactionType);
      if (!res) return;
      if (res.resultCode !== COMMENT_SUCCESS_CODE) return;

      setMyReactionByCommentId((prev) => ({
        ...prev,
        [commentId]: resolveMyReactionAfterRequest(reactionType),
      }));
      await loadComments();
    } finally {
      setReactingCommentId(null);
    }
  };

  // 댓글 목록 불러오기
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
      </div>

      <div className="comment-section__write-block">
        {/* <h4 id="comment-write-heading" className="comment-section__subheading">
          댓글 작성
        </h4> */}
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
                <SecretCommentLockIcon
                  locked={isSecretComment}
                  className="comment-section__secret-lock-icon"
                />
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
              <li key={comment.commentId} className="comment-section__root">
                <div className="comment-section__root-thread">
                  <CommentRow
                    variant="root"
                    comment={comment}
                    canViewSecretBody={resolveCanViewSecretBody(
                      comment,
                      currentUserId,
                      postOwnerUserId,
                    )}
                    canEdit={isOwnComment(comment.rgtrId)} // 댓글 소유 여부 확인
                    canDelete={isOwnComment(comment.rgtrId)} // 댓글 삭제 가능 여부 확인
                    isSaving={savingCommentId === comment.commentId} // 저장 API 호출 중
                    isEditing={editingCommentId === comment.commentId} // 수정 UI 표시 중
                    isDeleting={deletingCommentId === comment.commentId} // 삭제 중 여부 확인
                    onStartEdit={handleStartEdit} // 수정 시작
                    onCancelEdit={handleCancelEdit} // 수정 취소
                    onSaveEdit={handleSaveEdit} // 수정 저장
                    onReaction={handleReaction}
                    isReacting={reactingCommentId === comment.commentId} // 반응 중 여부 확인
                    myReaction={getMyReaction(comment.commentId, apiRows)}
                    editError={editingCommentId === comment.commentId ? editError : null} // 수정 오류 메시지 확인
                    onDelete={handleDeleteComment}
                    canReply={comment.depth === 0}
                  />

                  {comment.replies.length > 0 ? (
                    <ul className="comment-section__replies" aria-label="답글">
                      {comment.replies.map((reply) => (
                        <li key={reply.commentId} className="comment-section__reply">
                          <CommentRow
                            variant="reply"
                            comment={reply}
                            canViewSecretBody={resolveCanViewSecretBody(
                              reply,
                              currentUserId,
                              postOwnerUserId,
                            )}
                            canEdit={isOwnComment(reply.rgtrId)}
                            canDelete={isOwnComment(reply.rgtrId)}
                            isEditing={editingCommentId === reply.commentId}
                            isDeleting={deletingCommentId === reply.commentId}
                            isSaving={savingCommentId === reply.commentId}
                            editError={editingCommentId === reply.commentId ? editError : null}
                            onStartEdit={handleStartEdit}
                            onCancelEdit={handleCancelEdit}
                            onSaveEdit={handleSaveEdit}
                            onReaction={handleReaction}
                            isReacting={reactingCommentId === reply.commentId}
                            myReaction={getMyReaction(reply.commentId, apiRows)}
                            onDelete={handleDeleteComment}
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
            {isLoading ? (
              <span className="comment-section__infinite-loading">댓글 불러오는 중…</span>
            ) : null}
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
