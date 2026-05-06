import { Button } from "@/components";
import "@/pages/post/PostCommentSection.scss";

type PreviewComment = {
  id: string;
  author: string;
  dateLabel: string;
  body: string;
  likes: number;
  dislikes: number;
  replies?: readonly PreviewComment[];
};

/** API 연동 전 레이아웃용 정적 트리 (저장·반응 없음) */
const PREVIEW_COMMENTS: readonly PreviewComment[] = [
  {
    id: "preview-1",
    author: "김댓글",
    dateLabel: "58분 전",
    body: "UI 예시입니다. 백엔드 연동 후 실제 댓글이 이 자리에 표시됩니다.",
    likes: 12,
    dislikes: 0,
    replies: [
      {
        id: "preview-1-a",
        author: "박답글",
        dateLabel: "42분 전",
        body: "답글 스레드 예시입니다.",
        likes: 3,
        dislikes: 0,
      },
      {
        id: "preview-1-b",
        author: "최답글",
        dateLabel: "30분 전",
        body: "같은 부모 아래 두 번째 답글까지 스레드 선이 이어집니다.",
        likes: 1,
        dislikes: 0,
      },
    ],
  },
  {
    id: "preview-2",
    author: "이익명",
    dateLabel: "2026-04-29",
    body: "여러 줄도\n이렇게 보입니다.",
    likes: 0,
    dislikes: 0,
  },
] as const;

function countCommentsFlat(nodes: readonly PreviewComment[]): number {
  return nodes.reduce((acc, c) => acc + 1 + (c.replies?.length ? countCommentsFlat(c.replies) : 0), 0);
}

function avatarInitial(name: string) {
  const t = name.trim();
  return t ? t[0]! : "?";
}

/** 세로 레일(ul::before)과 겹치지 않게 꺾임+가로만 그림 — stroke 1px 고정 */
function ReplyThreadBranch() {
  return (
    <svg
      className="post-comment-section__thread-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        className="post-comment-section__thread-path"
        d="M 0.65 50 Q 0.65 61 11 61 L 100 61"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommentBody({
  author,
  dateLabel,
  body,
  likes,
  dislikes,
}: Pick<PreviewComment, "author" | "dateLabel" | "body" | "likes" | "dislikes">) {
  return (
    <>
      <div className="post-comment-section__item-meta">
        <span className="post-comment-section__author">{author}</span>
        <span className="post-comment-section__date">{dateLabel}</span>
      </div>
      <p className="post-comment-section__body">{body}</p>
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
}

/**
 * 게시글 상세 댓글 영역 — 레이아웃만 (API·상태 없음)
 */
export default function PostCommentSection() {
  const totalCount = countCommentsFlat(PREVIEW_COMMENTS);

  return (
    <section className="post-comment-section" aria-labelledby="post-comment-heading">
      <div className="post-comment-section__composer-card">
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
          <Button type="button" variant="primary" size="sm" disabled>
            등록
          </Button>
        </div>
      </div>

      <div className="post-comment-section__list-head">
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

      <ul className="post-comment-section__list">
        {PREVIEW_COMMENTS.map((comment) => (
          <li key={comment.id} className="post-comment-section__root">
            <div className="post-comment-section__root-thread">
              <div className="post-comment-section__item-inner">
                <div className="post-comment-section__avatar" aria-hidden>
                  {avatarInitial(comment.author)}
                </div>
                <div className="post-comment-section__item-main">
                  <CommentBody
                    author={comment.author}
                    dateLabel={comment.dateLabel}
                    body={comment.body}
                    likes={comment.likes}
                    dislikes={comment.dislikes}
                  />
                </div>
              </div>

              {comment.replies && comment.replies.length > 0 ? (
                <ul className="post-comment-section__replies" aria-label="답글">
                  {comment.replies.map((reply, index, arr) => (
                    <li
                      key={reply.id}
                      className={[
                        "post-comment-section__reply",
                        index === 0 ? "post-comment-section__reply--first" : "",
                        index === arr.length - 1 ? "post-comment-section__reply--last" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="post-comment-section__reply-start">
                        <div className="post-comment-section__reply-connector" aria-hidden>
                          <ReplyThreadBranch />
                        </div>
                        <div className="post-comment-section__avatar post-comment-section__avatar--reply" aria-hidden>
                          {avatarInitial(reply.author)}
                        </div>
                      </div>
                      <div className="post-comment-section__item-main">
                        <CommentBody
                          author={reply.author}
                          dateLabel={reply.dateLabel}
                          body={reply.body}
                          likes={reply.likes}
                          dislikes={reply.dislikes}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
