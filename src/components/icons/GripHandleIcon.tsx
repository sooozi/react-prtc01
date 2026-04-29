/** 드래그·순서 변경용 핸들(≡) 라인 아이콘 — `className`으로 색·크기는 부모 SCSS에서 제어 */
export function GripHandleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="16"
      viewBox="0 0 22 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="4" x2="17" y2="4" />
        <line x1="5" y1="8" x2="17" y2="8" />
        <line x1="5" y1="12" x2="17" y2="12" />
      </g>
    </svg>
  );
}
