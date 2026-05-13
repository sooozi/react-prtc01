/** 댓글 삭제 액션 — Feather trash-2와 동일 실루엣. 크기·색은 `className` / SCSS */
export function CommentDeleteIcon({ className }: { className?: string }) {
  const stroke = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" {...stroke} />
      <path
        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        {...stroke}
      />
      <line x1="10" y1="11" x2="10" y2="17" {...stroke} />
      <line x1="14" y1="11" x2="14" y2="17" {...stroke} />
    </svg>
  );
}
