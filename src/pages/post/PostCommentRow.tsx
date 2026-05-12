import { useLayoutEffect, useRef, useState } from "react";

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

/** 댓글 한 줄(루트·답글) — 레이아웃 + 본문 접기/펼치기 + 액션. 스타일은 `PostCommentSection.scss`. */
export function PostCommentRow({
  variant,
  avatarLetter,
  commentKey,
  author,
  dateLabel,
  body,
  likes,
  dislikes,
}: PostCommentRowProps) {
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el || expanded) {
      return;
    }

    const measure = () => {
      setCanExpand(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [body, commentKey, expanded]);

  const main = (
    <>
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
      <div className="post-comment-section__actions" role="group" aria-label="댓글 액션 (미연결)">
        <button type="button" className="post-comment-section__action" disabled>
          <span aria-hidden>👍</span>{" "}
          <span className="post-comment-section__action-count">{likes}</span>
        </button>
        <button type="button" className="post-comment-section__action" disabled>
          <span aria-hidden>👎</span>{" "}
          <span className="post-comment-section__action-count">{dislikes}</span>
        </button>
        <button type="button" className="post-comment-section__action post-comment-section__action--text" disabled>
          답글
        </button>
        <button type="button" className="post-comment-section__action post-comment-section__action--icon" aria-label="더보기" disabled>
          ···
        </button>
      </div>
    </>
  );

  if (variant === "root") {
    return (
      <div className="post-comment-section__item-inner">
        <div className="post-comment-section__avatar" aria-hidden>
          {avatarLetter}
        </div>
        <div className="post-comment-section__item-main">{main}</div>
      </div>
    );
  }

  return (
    <>
      <div className="post-comment-section__reply-start">
        <div className="post-comment-section__avatar post-comment-section__avatar--reply" aria-hidden>
          {avatarLetter}
        </div>
      </div>
      <div className="post-comment-section__item-main">{main}</div>
    </>
  );
}
