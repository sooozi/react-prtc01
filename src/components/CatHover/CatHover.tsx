import { useState } from "react";
import "./CatHover.scss";

const IMG_CAT_NORMAL =
  "https://i.postimg.cc/Ghm8C7jf/cute-cat-smiling-pixel-art-600nw-2414664891-removebg-preview.png";
const IMG_CAT_HOVER =
  "https://i.postimg.cc/R0KqRjMW/screaming-cat-pixel-art-meme-600nw-2421703801-removebg-preview.png";
const IMG_BUTTON = "https://i.postimg.cc/L56Xm5jP/Group-17.png";

/**
 * CodePen 고양이 컴포넌트
 * - 호버 시 웃는 고양이 → 짖는 고양이로 이미지 변경
 * - 버튼 이미지 클릭 가능
 */
export default function CatHover() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="cat-hover">
      <div className="cat-hover__container">
        <button type="button" className="cat-hover__btn-img" aria-label="버튼">
          <img src={IMG_BUTTON} alt="" />
        </button>
        <img
          src={isHovered ? IMG_CAT_HOVER : IMG_CAT_NORMAL}
          alt={isHovered ? "짖는 고양이" : "웃는 고양이"}
          className="cat-hover__img"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      </div>
    </div>
  );
}
