export function SgPreviewCommentCard() {
  return (
    <article className="sg-comment-card">
      <div className="sg-comment-card__avatar" aria-hidden>
        A
      </div>
      <div className="sg-comment-card__body">
        <header className="sg-comment-card__head">
          <span className="sg-comment-card__author">alex.dev</span>
          <time className="sg-comment-card__time" dateTime="2025-05-28">
            2시간 전
          </time>
        </header>
        <p className="sg-comment-card__text">
          디자인 토큰 기반으로 카드·spacing을 맞추면 페이지 간 일관성이 좋아집니다.
        </p>
      </div>
    </article>
  );
}
