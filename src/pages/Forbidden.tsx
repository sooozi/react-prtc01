import { useNavigate } from "react-router-dom";
import "./Forbidden.scss";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="forbidden-container">
      {/* 콘텐츠 */}
      <div className="content">
        {/* 아이콘 */}
        <div className="icon-wrapper">
          <span className="icon">🚫</span>
        </div>

        {/* 에러 코드 */}
        <span className="error-code">403</span>

        {/* 제목 */}
        <h1 className="title">
          접근이 <span className="gradient-text">제한된</span> 페이지
        </h1>

        {/* 설명 */}
        <p className="description">
          죄송합니다. 이 페이지에 접근할 권한이 없거나
          <br />
          잘못된 경로로 접근하셨습니다.
        </p>

        {/* 버튼 그룹 */}
        <div className="button-group">
          <button
            className="primary-button"
            onClick={() => navigate("/home")}
          >
            홈으로 돌아가기 →
          </button>
          <button
            className="secondary-button"
            onClick={() => navigate(-1)}
          >
            이전 페이지
          </button>
        </div>

        {/* 추가 도움말 */}
        <p className="help-text">
          문제가 계속되면 관리자에게 문의해주세요.
        </p>
      </div>
    </div>
  );
}
