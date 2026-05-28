export function SgEmptyState() {
  return (
    <div className="sg-empty" role="status">
      <span className="sg-empty__icon" aria-hidden>
        📭
      </span>
      <p>표시할 데이터가 없습니다.</p>
    </div>
  );
}
