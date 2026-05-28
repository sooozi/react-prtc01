import { Link } from "react-router-dom";

export type HomeMarqueeItem = {
  to: string;
  label: string;
};

type HomeMarqueeProps = {
  items: HomeMarqueeItem[];
};

export function HomeMarquee({ items }: HomeMarqueeProps) {
  const loop = [...items, ...items];

  return (
    <div className="home-marquee-wrap" aria-label="주요 메뉴">
      <div className="home-marquee-track">
        {loop.map((item, index) => (
          <span key={`${item.to}-${index}`} className="home-marquee-entry">
            <Link to={item.to} className="home-marquee-item">
              {item.label}
            </Link>
            <span className="home-marquee-sep" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
