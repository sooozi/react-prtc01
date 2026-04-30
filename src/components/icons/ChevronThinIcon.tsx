/** V자 쉐브론(얇은 선) — `direction`으로 위/아래, `className`은 부모 SCSS에서 제어 */
export function ChevronThinIcon({
  direction,
  className,
}: {
  direction: "up" | "down";
  className?: string;
}) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      {direction === "up" ? (
        <path
          d="M6.5 15.2 12 9.8l5.5 5.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M6.5 8.8 12 14.2l5.5-5.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
