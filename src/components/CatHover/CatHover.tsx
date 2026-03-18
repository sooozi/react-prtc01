import { useState, useCallback } from "react";
import { Button } from "@/components";
import "@/components/CatHover/CatHover.scss";

const IMG_CAT_NORMAL =
  "https://i.postimg.cc/Ghm8C7jf/cute-cat-smiling-pixel-art-600nw-2414664891-removebg-preview.png";
const IMG_CAT_HOVER =
  "https://i.postimg.cc/R0KqRjMW/screaming-cat-pixel-art-meme-600nw-2421703801-removebg-preview.png";
const IMG_BUTTON = "https://i.postimg.cc/L56Xm5jP/Group-17.png";

const HEARTS = ["❤️", "💕", "💗", "🧡", "💜", "🤍", "💛", "💙", "🩵"];
const HEART_COUNT = 6;
const FLOAT_DURATION_MS = 1800;

// 하트 크기(rem), 시작 위치 범위
const HEART_SIZE_MIN = 0.7;
const HEART_SIZE_MAX = 1.5;
const HEART_START_BOTTOM_MIN = 5;
const HEART_START_BOTTOM_MAX = 40;
const HEART_OFFSET_X_RANGE = 50;

type FloatingHeart = {
  id: number;
  emoji: string;
  offsetX: number;
  startBottom: number;
  size: number;
};

const FISH_SHRINK_DURATION_MS = 500;
/** 물고기 사라지는 중에 하트가 나오는 시점 (ms) */
const HEARTS_SPAWN_DELAY_MS = 150;

export default function CatHover() {
  const [isHovered, setIsHovered] = useState(false);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [fishShrinking, setFishShrinking] = useState<{ x: number; y: number } | null>(null);

  const spawnHearts = useCallback(() => {
    const newHearts: FloatingHeart[] = Array.from({ length: HEART_COUNT }, (_, i) => ({
      id: Date.now() + i,
      emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
      offsetX: (Math.random() - 0.5) * HEART_OFFSET_X_RANGE,
      startBottom: HEART_START_BOTTOM_MIN + Math.random() * (HEART_START_BOTTOM_MAX - HEART_START_BOTTOM_MIN),
      size: HEART_SIZE_MIN + Math.random() * (HEART_SIZE_MAX - HEART_SIZE_MIN),
    }));
    setHearts((prev) => [...prev, ...newHearts]);
    newHearts.forEach(({ id }) => {
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, FLOAT_DURATION_MS);
    });
  }, []);

  const handleMouthEnter = useCallback((e: React.MouseEvent) => {
    setFishShrinking({ x: e.clientX, y: e.clientY });
    setTimeout(() => spawnHearts(), HEARTS_SPAWN_DELAY_MS);
    setTimeout(() => setFishShrinking(null), FISH_SHRINK_DURATION_MS);
  }, [spawnHearts]);

  return (
    <div className="cat-hover">
      <div className="cat-hover__container">
        {/* 떠오르는 하트 */}
        <div className="cat-hover__hearts" aria-hidden>
          {hearts.map(({ id, emoji, offsetX, startBottom, size }) => (
            <span
              key={id}
              className="cat-hover__heart"
              style={
                {
                  "--heart-offset-x": `${offsetX}px`,
                  "--heart-start-bottom": `${startBottom}%`,
                  "--heart-size": `${size}rem`,
                } as React.CSSProperties
              }
            >
              {emoji}
            </span>
          ))}
        </div>

        <Button type="button" variant="ghost" className="cat-hover__btn-img" aria-label="버튼">
          <img src={IMG_BUTTON} alt="" draggable={false} />
        </Button>
        <div
          className="cat-hover__img-wrap"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={isHovered ? IMG_CAT_HOVER : IMG_CAT_NORMAL}
            draggable={false}
            alt={isHovered ? "짖는 고양이" : "웃는 고양이"}
            className="cat-hover__img"
          />
          {isHovered && (
            <div
              className="cat-hover__mouth-zone"
              onMouseEnter={handleMouthEnter}
              aria-hidden
            />
          )}
        </div>
        {fishShrinking && (
          <div
            className="cat-hover__fish-shrink"
            style={{ left: fishShrinking.x, top: fishShrinking.y }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
