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
import {
  buildReplyCommentRequest,
  buildRootCommentRequest,
  isRootComment,
} from "@/lib/comment/buildCreateCommentRequest";
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

// 댓글 트리 노드 타입
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
  const map = new Map<number, CommentTreeNode>(); // 댓글 ID와 댓글 노드 매핑(댓글 찾기용 주소록)

  // 1단계: 모든 댓글을 주소록(map)에 등록(댓글 목록 하나씩 반복해서 확인) [주소록 만들기]
  for (const row of rows) {
    map.set(row.commentId, { ...row, replies: [] }); // 댓글 노드 생성(댓글 ID를 key로 해서 map에 저장)
  }

  const roots: CommentTreeNode[] = []; // 루트 댓글 목록

  // 2단계: 모든 댓글을 트리 구조로 변환(댓글 목록 하나씩 반복해서 확인) [부모 찾아서 연결]
  for (const row of rows) {
    const node = map.get(row.commentId)!;
    // 부모가 없는 댓글(루트 댓글)인 경우 '일반 댓글'로 분류
    if (isRootComment(row.parentCommentId)) {
      roots.push(node);
    } else {
      const parent = map.get(row.parentCommentId!);
      if (parent)
        parent.replies.push(node); // 부모 댓글 목록에 추가
      else roots.push(node);
    }
  }

  // 3단계: 댓글 트리 목록 정렬(최상위: 최신순, 최하위: 오래된순) [정렬]
  roots.sort(compareCommentsNewestFirst); // 댓글 정렬(최상위: 최신순)
  sortCommentRepliesOldestFirst(roots); // 답글 정렬[재귀함수](최하위: 오래된순)
  return roots; // 댓글 트리 목록 반환
}

// 답글 정렬[재귀함수]
function sortCommentRepliesOldestFirst(nodes: CommentTreeNode[]) {
  nodes.sort(compareCommentsOldestFirst); // 답글 정렬[기본함수]
  for (const node of nodes) {
    // 답글 목록 하나씩 반복해서 확인
    if (node.replies.length > 0) sortCommentRepliesOldestFirst(node.replies); // 답글 정렬
  }
}

// 비밀 댓글 보기 가능 여부 확인
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

  // 현재 로그인 사용자 ID 조회
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const commentTrees = useMemo(() => flatRowsToTrees(apiRows), [apiRows]);

  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null); // 삭제 중인 댓글 ID
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null); // 수정 중인 댓글 ID

  const [savingCommentId, setSavingCommentId] = useState<number | null>(null); // 추가
  const [editError, setEditError] = useState<string | null>(null); // 추가 (선택)

  const [reactingCommentId, setReactingCommentId] = useState<number | null>(null); // 반응 중인 댓글 ID
  const [myReactionByCommentId, setMyReactionByCommentId] = useState<
    Record<number, CommentUserReaction | null>
  >({}); // 내 반응 매핑

  const [replyingTo, setReplyingTo] = useState<CommentListItem | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // 내 반응 동기화
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

  // 내 반응 조회
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
      setIsLoading(true); // 댓글 목록 로딩 중 여부 표시
      setIsInitialListReady(false); // 댓글 목록 초기화 여부 표시
      try {
        const items = await selectCommentList({ postNumber }); // 댓글 목록 조회
        if (signal?.aborted) return; // 취소 플래그 확인

        if (!items) {
          // 댓글 목록 조회 실패 시
          if (!signal?.aborted) setInitialError("댓글을 불러오지 못했습니다.");
          return;
        }

        setInitialError(null); // 초기화 오류 메시지 초기화
        setApiRows(items); // 받은 댓글 목록 저장
        setTotalCount(items.length); // 댓글 개수 설정
        syncMyReactionsFromRows(items); // 내 반응 동기화
      } catch {
        if (!signal?.aborted) setInitialError("댓글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false); // 댓글 목록 로딩 중 여부 초기화
        if (!signal?.aborted) setIsInitialListReady(true); // 댓글 목록 초기화 여부 표시
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
    setReplyingTo(null);
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
        if (replyingTo?.commentId === commentId) setReplyingTo(null);
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

  // 댓글 반응 — 클릭 즉시 UI 반영(낙관적 업데이트), 실패 시 되돌림
  const handleReaction = async (commentId: number, reactionType: CommentReactionType) => {
    if (reactingCommentId != null) return;

    const row = apiRows.find((item) => item.commentId === commentId);
    const previousReaction =
      commentId in myReactionByCommentId
        ? (myReactionByCommentId[commentId] ?? null)
        : row
          ? resolveCommentMyReaction(row)
          : null;
    const nextReaction = resolveMyReactionAfterRequest(reactionType);

    setReactingCommentId(commentId);
    setMyReactionByCommentId((prev) => ({ ...prev, [commentId]: nextReaction }));

    try {
      const res = await reactToComment(commentId, reactionType);
      if (!res || res.resultCode !== COMMENT_SUCCESS_CODE) {
        setMyReactionByCommentId((prev) => ({ ...prev, [commentId]: previousReaction }));
        return;
      }
      await loadComments();
    } catch {
      setMyReactionByCommentId((prev) => ({ ...prev, [commentId]: previousReaction }));
    } finally {
      setReactingCommentId(null);
    }
  };

  // 대댓글 작성 시작
  const handleStartReply = (comment: CommentListItem) => {
    if (deletingCommentId != null || savingCommentId != null) return; // 삭제 중이면 대댓글과 겹치지 않게 끔
    setEditingCommentId(null); // 수정 중인 댓글 ID 초기화
    setEditError(null); // 수정 오류 메시지 초기화
    setReplyError(null); // 대댓글 오류 메시지 초기화
    setReplyingTo(comment); // 대댓글 작성 중인 댓글 설정
  };

  // 대댓글 작성 취소
  const handleCancelReply = () => {
    setReplyingTo(null); // 대댓글 작성 중인 댓글 초기화
    setReplyError(null);
  }; // 대댓글 오류 메시지 초기화

  // 대댓글 등록
  const handleSubmitReply = async (content: string) => {
    if (!replyingTo || isSubmittingReply) return; // 대댓글 작성 중이면 겹치지 않게 끔

    const trimmed = content.trim();
    if (!trimmed) return; // 대댓글 내용 양쪽 공백 제거

    setIsSubmittingReply(true);
    setReplyError(null); // 대댓글 오류 메시지 초기화

    // 대댓글 등록 API 호출
    try {
      const res = await createComment(
        buildReplyCommentRequest({
          postNumber,
          content: trimmed,
          parent: replyingTo,
          secretYn: "N",
        }),
      );

      if (!res) return;

      // 등록 실패 → 등록 오류 메시지 표시
      if (res.resultCode !== COMMENT_SUCCESS_CODE) {
        setReplyError(
          res.resultMessage ?? res.resultDetailMessage ?? "대댓글 등록에 실패했습니다.",
        );
        return;
      }

      setReplyingTo(null); // 대댓글 작성 중인 댓글 초기화
      await loadComments(); // 다시 불러와서 목록 재구성
    } finally {
      setIsSubmittingReply(false); // 대댓글 등록 중 여부 초기화
    }
  };

  // 댓글 목록 불러오기
  useEffect(() => {
    const ac = new AbortController();
    queueMicrotask(() => {
      if (ac.signal.aborted) return;
      void loadComments(ac.signal); // 댓글 목록 불러오기(페이지 열리면 자동 실행)
    });
    return () => ac.abort(); // 댓글 목록 불러오기 취소(페이지 닫으면 자동 실행)
  }, [loadComments]);

  const renderCommentThread = (comment: CommentTreeNode, variant: "root" | "reply") => (
    <>
      <CommentRow
        variant={variant}
        comment={comment}
        canViewSecretBody={resolveCanViewSecretBody(comment, currentUserId, postOwnerUserId)}
        canEdit={isOwnComment(comment.rgtrId)}
        canDelete={isOwnComment(comment.rgtrId)}
        isSaving={savingCommentId === comment.commentId}
        isEditing={editingCommentId === comment.commentId}
        isDeleting={deletingCommentId === comment.commentId}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
        onReaction={handleReaction}
        isReacting={reactingCommentId === comment.commentId}
        myReaction={getMyReaction(comment.commentId, apiRows)}
        editError={editingCommentId === comment.commentId ? editError : null}
        onDelete={handleDeleteComment}
        canReply
        isReplying={replyingTo?.commentId === comment.commentId}
        isSubmittingReply={isSubmittingReply && replyingTo?.commentId === comment.commentId}
        replyError={replyingTo?.commentId === comment.commentId ? replyError : null}
        onStartReply={handleStartReply}
        onCancelReply={handleCancelReply}
        onSubmitReply={handleSubmitReply}
      />

      {comment.replies.length > 0 ? (
        <ul className="comment-section__replies" aria-label="대댓글">
          {comment.replies.map((reply) => (
            <li key={reply.commentId} className="comment-section__reply">
              {renderCommentThread(reply, "reply")}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

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
                  {renderCommentThread(comment, "root")}
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
