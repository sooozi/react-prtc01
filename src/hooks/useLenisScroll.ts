import Lenis from "lenis";
import { useEffect } from "react";

export type LenisScrollOptions = {
  /** false면 인스턴스를 생성하지 않음 */
  enabled?: boolean;
  smoothWheel?: boolean;
  lerp?: number;
  autoRaf?: boolean;
};

const DEFAULT_LENIS_OPTIONS = {
  smoothWheel: true,
  lerp: 0.1,
  autoRaf: true,
} as const satisfies Omit<LenisScrollOptions, "enabled">;

/**
 * Lenis 인스턴스 생명주기. Layout에서 pathname 조건과 함께 사용한다.
 * enabled가 false→true일 때 생성, true→false일 때 destroy + raf 정리.
 */
export function useLenisScroll(options: LenisScrollOptions = {}): void {
  const {
    enabled = true,
    smoothWheel = DEFAULT_LENIS_OPTIONS.smoothWheel,
    lerp = DEFAULT_LENIS_OPTIONS.lerp,
    autoRaf = DEFAULT_LENIS_OPTIONS.autoRaf,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      smoothWheel,
      lerp,
      autoRaf,
    });

    let rafId: number | null = null;

    if (!autoRaf) {
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      lenis.destroy();
    };
  }, [enabled, smoothWheel, lerp, autoRaf]);
}
