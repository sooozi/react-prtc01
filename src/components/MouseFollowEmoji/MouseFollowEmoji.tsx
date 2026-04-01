import { useEffect, useRef } from "react";
import "@/components/MouseFollowEmoji/MouseFollowEmoji.scss";

type MouseFollowEmojiProps = {
  /** 기본값: 고양이 */
  emoji?: string;
  /** 커서 끝에서 오른쪽·아래로 띄우는 픽셀 */
  offsetX?: number;
  offsetY?: number;
};

/**
 * 마우스/포인터 위치를 따라다니는 이모지 레이어.
 * - `position: fixed` + `transform`으로 이동 (리렌더 없음)
 * - 터치·저모션 환경에서는 CSS로 숨김
 */
export default function MouseFollowEmoji({
  emoji = "🐱",
  offsetX = 10,
  offsetY = 10,
}: MouseFollowEmojiProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.classList.add("mouse-follow-emoji--active");
        el.style.transform = `translate3d(${e.clientX + offsetX}px, ${e.clientY + offsetY}px, 0)`;
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [offsetX, offsetY]);

  return (
    <span ref={ref} className="mouse-follow-emoji" aria-hidden>
      {emoji}
    </span>
  );
}
