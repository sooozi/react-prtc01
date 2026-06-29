import { useEffect, useRef } from "react";
import Home from "@/pages/home/Home";
import "@/pages/testmain/TestMainHeroDemo.scss";

const SCROLL_SPEED = 0.4;

export function TestMainHeroDemo() {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let rafId = 0;
    let direction = 1;

    const tick = () => {
      const maxScroll = viewport.scrollHeight - viewport.clientHeight;
      if (maxScroll > 0) {
        viewport.scrollTop += SCROLL_SPEED * direction;
        if (viewport.scrollTop >= maxScroll - 1) {
          viewport.scrollTop = maxScroll;
          direction = -1;
        } else if (viewport.scrollTop <= 0) {
          direction = 1;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="testmain-hero-demo">
      <div className="testmain-browser">
        <div className="testmain-browser__chrome" aria-hidden>
          <span className="testmain-browser__dots">
            <span />
            <span />
            <span />
          </span>
          <span className="testmain-browser__url">localhost/home</span>
        </div>
        <div className="testmain-browser__viewport" ref={viewportRef}>
          <Home preview />
        </div>
      </div>
      <p className="visually-hidden">메인 화면(/home) 자동 스크롤 데모</p>
    </div>
  );
}
