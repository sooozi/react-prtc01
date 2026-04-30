/** 시계(원+바늘) 라인 아이콘 — `className`으로 크기·색은 부모 SCSS에서 제어 */
export function ClockOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.35" />
      <path d="M12 8.2V12l3 1.9" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}
