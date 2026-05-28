const BAR_HEIGHTS = [40, 65, 45, 80, 55, 90, 70] as const;

export function SgDashboardWidget() {
  return (
    <div className="sg-widget sg-widget--stat">
      <p className="sg-widget__label">이번 주 조회수</p>
      <p className="sg-widget__value">12,480</p>
      <p className="sg-widget__delta sg-widget__delta--up">+18.2%</p>
      <div className="sg-widget__bars" aria-hidden>
        {BAR_HEIGHTS.map((h, i) => (
          <span key={i} className="sg-widget__bar" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
