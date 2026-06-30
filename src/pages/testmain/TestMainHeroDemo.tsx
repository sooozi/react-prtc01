import { useEffect, useRef } from "react";
import Home from "@/pages/home/Home";
import "@/pages/testmain/TestMainHeroDemo.scss";

const SCROLL_SPEED = 0.55;
const START_DELAY_MS = 1000;
const END_PAUSE_MS = 1000;

export function TestMainHeroDemo() {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let rafId = 0;
    let pauseUntil = performance.now() + START_DELAY_MS;
    let isPausedAtBottom = false;

    const tick = (now: number) => {
      const maxScroll = viewport.scrollHeight - viewport.clientHeight;

      if (maxScroll <= 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (now < pauseUntil) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (isPausedAtBottom) {
        viewport.scrollTop = 0;
        isPausedAtBottom = false;
        rafId = requestAnimationFrame(tick);
        return;
      }

      viewport.scrollTop = Math.min(viewport.scrollTop + SCROLL_SPEED, maxScroll);

      if (viewport.scrollTop >= maxScroll - 1) {
        viewport.scrollTop = maxScroll;
        isPausedAtBottom = true;
        pauseUntil = now + END_PAUSE_MS;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      const maxScroll = viewport.scrollHeight - viewport.clientHeight;
      if (maxScroll > 0 && viewport.scrollTop > maxScroll) {
        viewport.scrollTop = maxScroll;
      }
    });
    ro.observe(viewport);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
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
