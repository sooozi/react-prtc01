import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export type HomeMarqueeItem = {
  to: string;
  label: string;
};

type HomeMarqueeProps = {
  items: HomeMarqueeItem[];
};

function MarqueeEntry({ item }: { item: HomeMarqueeItem }) {
  return (
    <span className="home-marquee-entry">
      <Link to={item.to} className="home-marquee-item">
        {item.label}
      </Link>
      <span className="home-marquee-sep" aria-hidden>
        ✦
      </span>
    </span>
  );
}

export function HomeMarquee({ items }: HomeMarqueeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [copiesPerHalf, setCopiesPerHalf] = useState(4);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const measure = measureRef.current;
    if (!wrap || !measure) return;

    const sync = () => {
      const containerWidth = wrap.clientWidth;
      const setWidth = measure.scrollWidth;
      if (!containerWidth || !setWidth) return;

      const next = Math.max(2, Math.ceil(containerWidth / setWidth) + 1);
      setCopiesPerHalf((prev) => (prev === next ? prev : next));
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [items]);

  const half = Array.from({ length: copiesPerHalf }, () => items).flat();
  const loop = [...half, ...half];

  return (
    <div className="home-marquee-wrap" ref={wrapRef} aria-label="주요 메뉴">
      <div className="home-marquee-measure" ref={measureRef} aria-hidden="true">
        {items.map((item) => (
          <MarqueeEntry key={item.to} item={item} />
        ))}
      </div>
      <div className="home-marquee-track">
        {loop.map((item, index) => (
          <MarqueeEntry key={`${item.to}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}
