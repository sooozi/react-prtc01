import { useLayoutEffect, useRef, useState } from "react";
import type { CommentListItem } from "@/api/board/boardApi.types";
import { Confirm } from "@/components";
import { CommentDeleteIcon } from "@/components/icons/CommentDeleteIcon";
import { SecretCommentLockIcon } from "@/components/icons/SecretCommentLockIcon";

export type CommentRowProps = {
  variant: "root" | "reply";
  comment: CommentListItem;
  canViewSecretBody?: boolean;
  canDelete?: boolean;
  isDeleting?: boolean;
  onDelete?: (commentId: number) => Promise<void>;
};

function avatarInitial(name: string) {
  const t = name.trim();
  return t ? t[0]! : "?";
}

// 댓글 한 줄(루트·답글) — 레이아웃 + 본문 접기/펼치기 + 액션
export function CommentRow({
  comment,
  canViewSecretBody = true,
  canDelete = false,
  isDeleting = false,
  onDelete,
}: CommentRowProps) {
  const commentKey = String(comment.commentId);
  const isDeleted = comment.delYn === "Y";
  const isSecret = comment.secretYn === "Y";
  const dateLabel = comment.regDt.slice(0, 10);

  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCnt);
  const [dislikeCount, setDislikeCount] = useState(comment.dislikeCnt);

  const isLocked = isSecret && !canViewSecretBody;

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
  }, [comment.content, commentKey, expanded, isLocked, isDeleted]);

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
        {isDeleted ? (
          <CommentDeleteIcon className="comment-section__avatar-deleted-icon" />
        ) : (
          avatarInitial(comment.rgtrName)
        )}
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
                  {comment.content}
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

            <div className="comment-section__actions" role="group" aria-label="댓글 반응 및 작업">
              <button
                type="button"
                className="comment-section__action"
                aria-label={`좋아요 ${likeCount}개`}
                disabled={isLocked}
                onClick={() => {
                  setLikeCount(likeCount + 1);
                }}
              >
                <span aria-hidden>👍</span>{" "}
                <span className="comment-section__action-count" aria-hidden>
                  {likeCount}
                </span>
              </button>
              <button
                type="button"
                className="comment-section__action"
                aria-label={`싫어요 ${dislikeCount}개`}
                disabled={isLocked}
                onClick={() => {
                  setDislikeCount(dislikeCount + 1);
                }}
              >
                <span aria-hidden>👎</span>{" "}
                <span className="comment-section__action-count" aria-hidden>
                  {dislikeCount}
                </span>
              </button>
              <button
                type="button"
                className="comment-section__action comment-section__action--text"
                disabled
              >
                답글
              </button>
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
