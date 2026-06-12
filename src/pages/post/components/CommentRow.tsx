import { useLayoutEffect, useRef, useState } from "react";
import type {
  CommentListItem,
  CommentReactionType,
  CommentUserReaction,
} from "@/api/board/boardApi.types";
import { resolveReactionRequestType } from "@/lib/comment/resolveCommentMyReaction";
import { Button, Confirm } from "@/components";
import { CommentDeleteIcon } from "@/components/icons/CommentDeleteIcon";
import { SecretCommentLockIcon } from "@/components/icons/SecretCommentLockIcon";

export type CommentRowProps = {
  variant: "root" | "reply";
  comment: CommentListItem;
  canViewSecretBody?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  isEditing?: boolean;
  isDeleting?: boolean;
  isSaving?: boolean;
  editError?: string | null;
  isReacting?: boolean;
  myReaction?: CommentUserReaction | null;
  onStartEdit?: (commentId: number) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: (commentId: number, content: string) => void; // 댓글 수정
  onReaction?: (commentId: number, reactionType: CommentReactionType) => void; // 댓글 반응
  canReply?: boolean;
  onDelete?: (commentId: number) => Promise<void>;
};

// 아바타 초기 문자
function avatarInitial(name: string) {
  const t = name.trim();
  return t ? t[0]! : "?";
}

// 댓글 한 줄(루트·답글) — 레이아웃 + 본문 접기/펼치기 + 액션
export function CommentRow({
  comment,
  canViewSecretBody = true,
  canEdit = false,
  canDelete = false,
  isEditing = false,
  isDeleting = false,
  isSaving = false,
  editError = null,
  isReacting = false,
  myReaction = null,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onReaction,
  canReply = false,
  onDelete,
}: CommentRowProps) {
  const commentKey = String(comment.commentId);
  const isDeleted = comment.delYn === "Y";
  const isSecret = comment.secretYn === "Y";
  const dateLabel = comment.regDt.slice(0, 10);
  const commentContent = comment.content ?? ""; // 댓글 내용

  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editDraft, setEditDraft] = useState(commentContent);

  const isLocked = isSecret && !canViewSecretBody;
  const editDraftTrimmed = editDraft.trim(); // 수정 초안 양쪽 공백 제거
  // 수정 가능 여부 확인
  const canSaveEdit = editDraftTrimmed.length > 0 && editDraftTrimmed !== commentContent.trim();

  // 본문 접기/펼치기 가능 여부 확인
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el || expanded || isLocked || isDeleted) {
      return;
    }

    const measure = () => {
      setCanExpand(el.scrollHeight > el.clientHeight + 1);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [commentContent, commentKey, expanded, isLocked, isDeleted]);

  const commentRow = (
    <div
      className={[
        "comment-section__item-inner",
        isDeleted ? "comment-section__item-inner--deleted" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={["comment-section__avatar", isDeleted ? "comment-section__avatar--deleted" : ""]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        {avatarInitial(comment.rgtrName)}
      </div>
      <div className="comment-section__item-main">
        {isDeleted ? (
          <div
            className="comment-section__deleted-notice"
            aria-labelledby={`${commentKey}-deleted-label`}
          >
            <p id={`${commentKey}-deleted-label`} className="comment-section__deleted-label">
              <CommentDeleteIcon className="comment-section__deleted-icon" />
              <span className="comment-section__deleted-text">삭제된 댓글입니다.</span>
            </p>
          </div>
        ) : (
          <>
            <div className="comment-section__item-meta">
              <span className="comment-section__author">{comment.rgtrName}</span>
              {isSecret ? (
                <span className="comment-section__secret-badge">
                  <SecretCommentLockIcon locked className="comment-section__secret-badge-icon" />
                  비밀
                </span>
              ) : null}
              <span className="comment-section__date">{dateLabel}</span>
            </div>

            {isLocked ? (
              <div
                className="comment-section__secret-locked"
                aria-labelledby={`${commentKey}-secret-label`}
              >
                <p
                  id={`${commentKey}-secret-label`}
                  className="comment-section__secret-locked-label"
                >
                  <SecretCommentLockIcon locked className="comment-section__secret-locked-icon" />
                  <span className="comment-section__secret-locked-text">
                    <span>비밀댓글입니다.</span>{" "}
                    <span className="comment-section__secret-locked-desc">
                      게시글 작성자와 댓글 작성자만 볼 수 있습니다.
                    </span>
                  </span>
                </p>
              </div>
            ) : isEditing ? (
              <div className="comment-section__edit-card">
                <label htmlFor={`comment-edit-${commentKey}`} className="visually-hidden">
                  댓글 수정
                </label>
                <textarea
                  id={`comment-edit-${commentKey}`}
                  className="comment-section__edit-draft"
                  rows={4}
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  disabled={isDeleting}
                />
                <div className="comment-section__edit-foot">
                  <Button
                    type="button"
                    variant="outlinePrimary"
                    size="sm"
                    className="comment-section__edit-cancel"
                    disabled={isDeleting}
                    onClick={() => onCancelEdit?.()}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="comment-section__edit-save"
                    disabled={isDeleting || isSaving || !canSaveEdit}
                    onClick={() => onSaveEdit?.(comment.commentId, editDraftTrimmed)}
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </Button>
                </div>
                {editError ? (
                  <p className="comment-section__edit-error" role="alert">
                    {editError}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="comment-section__body-block">
                <p
                  ref={bodyRef}
                  className={[
                    "comment-section__body",
                    expanded
                      ? "comment-section__body--expanded"
                      : "comment-section__body--collapsed",
                  ].join(" ")}
                >
                  {commentContent}
                </p>
                {canExpand ? (
                  <button
                    type="button"
                    className="comment-section__expand-toggle"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                  >
                    {expanded ? "접기" : "펼치기"}
                  </button>
                ) : null}
              </div>
            )}

            {!isEditing ? (
              <div className="comment-section__actions" role="group" aria-label="댓글 반응 및 작업">
                <button
                  type="button"
                  className={[
                    "comment-section__action",
                    myReaction === "LIKE" ? "comment-section__action--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`좋아요 ${comment.likeCnt}개`}
                  aria-pressed={myReaction === "LIKE"}
                  disabled={isLocked || isReacting}
                  onClick={() =>
                    onReaction?.(comment.commentId, resolveReactionRequestType(myReaction, "LIKE"))
                  }
                >
                  <span aria-hidden>👍</span>{" "}
                  <span className="comment-section__action-count" aria-hidden>
                    {comment.likeCnt}
                  </span>
                </button>
                <button
                  type="button"
                  className={[
                    "comment-section__action",
                    myReaction === "DISLIKE" ? "comment-section__action--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`싫어요 ${comment.dislikeCnt}개`}
                  aria-pressed={myReaction === "DISLIKE"}
                  disabled={isLocked || isReacting}
                  onClick={() =>
                    onReaction?.(
                      comment.commentId,
                      resolveReactionRequestType(myReaction, "DISLIKE"),
                    )
                  }
                >
                  <span aria-hidden>👎</span>{" "}
                  <span className="comment-section__action-count" aria-hidden>
                    {comment.dislikeCnt}
                  </span>
                </button>
                {canReply ? (
                  <button
                    type="button"
                    className="comment-section__action comment-section__action--text"
                    disabled={isLocked || isDeleting}
                    onClick={() => console.log("답글")}
                  >
                    답글
                  </button>
                ) : null}
                {canEdit ? (
                  <button
                    type="button"
                    className="comment-section__action comment-section__action--text comment-section__action--edit"
                    disabled={isDeleting}
                    onClick={() => {
                      setEditDraft(commentContent);
                      onStartEdit?.(comment.commentId);
                    }}
                  >
                    수정
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    className="comment-section__action comment-section__action--icon comment-section__action--delete"
                    aria-label="댓글 삭제"
                    disabled={isDeleting}
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <CommentDeleteIcon className="comment-section__delete-icon" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {commentRow}
      <Confirm
        open={deleteConfirmOpen}
        title="댓글 삭제"
        message="이 댓글을 삭제할까요?"
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={async () => {
          setDeleteConfirmOpen(false);
          if (!onDelete) return;
          await onDelete(comment.commentId);
        }}
      />
    </>
  );
}
