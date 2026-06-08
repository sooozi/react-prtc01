import { useLayoutEffect, useRef, useState } from "react";
import { Confirm } from "@/components";
import { CommentDeleteIcon } from "@/components/icons/CommentDeleteIcon";
import { SecretCommentLockIcon } from "@/components/icons/SecretCommentLockIcon";

export type CommentRowProps = {
  variant: "root" | "reply";
  avatarLetter: string;
  commentKey: string;
  author: string;
  dateLabel: string;
  body: string;
  likes: number;
  dislikes: number;
  isSecret?: boolean;
  canViewSecretBody?: boolean;
};

// 댓글 한 줄(루트·답글) — 레이아웃 + 본문 접기/펼치기 + 액션
export function CommentRow({
  avatarLetter,
  commentKey,
  author,
  dateLabel,
  body,
  likes,
  dislikes,
  isSecret = false,
  canViewSecretBody = true,
}: CommentRowProps) {
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [dislikeCount, setDislikeCount] = useState(dislikes);

  const isLocked = isSecret && !canViewSecretBody;

  // 본문 접기/펼치기 가능 여부 확인
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el || expanded || isLocked) {
      return;
    }

    const measure = () => {
      setCanExpand(el.scrollHeight > el.clientHeight + 1);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [body, commentKey, expanded, isLocked]);

  const commentRow = (
    <div className="comment-section__item-inner">
      <div className="comment-section__avatar" aria-hidden>
        {avatarLetter}
      </div>
      <div className="comment-section__item-main">
        <div className="comment-section__item-meta">
          <span className="comment-section__author">{author}</span>
          {isSecret ? (
            <span className="comment-section__secret-badge">
              <SecretCommentLockIcon locked className="comment-section__secret-badge-icon" />
              비밀
            </span>
          ) : null}
          <span className="comment-section__date">{dateLabel}</span>
        </div>

        {isLocked ? (
          <div className="comment-section__secret-locked" aria-labelledby={`${commentKey}-secret-label`}>
            <p id={`${commentKey}-secret-label`} className="comment-section__secret-locked-label">
              <SecretCommentLockIcon locked className="comment-section__secret-locked-icon" />
              비밀댓글입니다. 게시글 작성자와 댓글 작성자만 볼 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="comment-section__body-block">
            <p
              ref={bodyRef}
              className={[
                "comment-section__body",
                expanded ? "comment-section__body--expanded" : "comment-section__body--collapsed",
              ].join(" ")}
            >
              {body}
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
          <button type="button" className="comment-section__action comment-section__action--text" disabled>
            답글
          </button>
          <button
            type="button"
            className="comment-section__action comment-section__action--icon comment-section__action--delete"
            aria-label="댓글 삭제"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <CommentDeleteIcon className="comment-section__delete-icon" />
          </button>
        </div>
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
        onConfirm={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
