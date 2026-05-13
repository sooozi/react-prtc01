import { useLayoutEffect, useRef, useState } from "react";
import { Confirm } from "@/components";
import { CommentDeleteIcon } from "@/components/icons/CommentDeleteIcon";

export type PostCommentRowProps = {
  variant: "root" | "reply";
  avatarLetter: string;
  commentKey: string;
  author: string;
  dateLabel: string;
  body: string;
  likes: number;
  dislikes: number;
};

/** 댓글 한 줄(루트·답글) — 레이아웃 + 본문 접기/펼치기 + 액션 */
export function PostCommentRow({
  variant,
  avatarLetter,
  commentKey, // 댓글 고유 ID
  author,
  dateLabel,
  body, // 본문
  likes,
  dislikes,
}: PostCommentRowProps) {
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false); // 본문 접기/펼치기 상태
  const [canExpand, setCanExpand] = useState(false); // 본문 접기/펼치기 가능 여부
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // 댓글 삭제 확인 창 상태
  const [likeCount, setLikeCount] = useState(likes);
  const [dislikeCount, setDislikeCount] = useState(dislikes);

  // 본문 접기/펼치기 기능(버튼 노출)
  useLayoutEffect(() => {
    const el = bodyRef.current;
    // 본문 요소가 없거나 이미 펼쳐져 있으면 종료
    if (!el || expanded) {
      return;
    }

    // 본문 요소 크기 측정
    const measure = () => {
      setCanExpand(el.scrollHeight > el.clientHeight + 1);
    };

    measure();

    // 본문 요소 크기 변경 감지
    const ro = new ResizeObserver(measure);
    ro.observe(el); // 본문 요소 크기 측정 시작
    return () => ro.disconnect(); // 리사이즈 옵저버 해제
  }, [body, commentKey, expanded]); // 의존성 배열: 본문 요소 크기 변경 감지

  const commentRow = (
    <div className="post-comment-section__item-inner">
      <div className="post-comment-section__avatar" aria-hidden>
        {avatarLetter}
      </div>
      <div className="post-comment-section__item-main">
        <div className="post-comment-section__item-meta">
          <span className="post-comment-section__author">{author}</span>
          <span className="post-comment-section__date">{dateLabel}</span>
        </div>
        <div className="post-comment-section__body-block">
          <p
            ref={bodyRef}
            className={[
              "post-comment-section__body",
              expanded ? "post-comment-section__body--expanded" : "post-comment-section__body--collapsed",
            ].join(" ")}
          >
            {body}
          </p>
          {canExpand ? (
            <button
              type="button"
              className="post-comment-section__expand-toggle"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded ? "접기" : "펼치기"}
            </button>
          ) : null}
        </div>
        <div className="post-comment-section__actions" role="group" aria-label="댓글 반응 및 작업">
          <button
            type="button"
            className="post-comment-section__action"
            aria-label={`좋아요 ${likeCount}개`}
            onClick={() => {
            setLikeCount(likeCount + 1);
          }}>
            <span aria-hidden>👍</span>{" "}
            <span className="post-comment-section__action-count" aria-hidden>
              {likeCount}
            </span>
          </button>
          <button
            type="button"
            className="post-comment-section__action"
            aria-label={`싫어요 ${dislikeCount}개`}
            onClick={() => {
            setDislikeCount(dislikeCount + 1);
          }}>
            <span aria-hidden>👎</span>{" "}
            <span className="post-comment-section__action-count" aria-hidden>
              {dislikeCount}
            </span>
          </button>
          <button type="button" className="post-comment-section__action post-comment-section__action--text" disabled>
            답글
          </button>
          <button
            type="button"
            className="post-comment-section__action post-comment-section__action--icon post-comment-section__action--delete"
            aria-label="댓글 삭제"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <CommentDeleteIcon className="post-comment-section__delete-icon" />
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
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          console.log("[댓글 삭제]", { commentId: commentKey, variant, 삭제: true });
        }}
      />
    </>
  );
}
