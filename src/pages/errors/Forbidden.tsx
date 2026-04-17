import { useNavigate } from "react-router-dom";
import { Button } from "@/components";
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
          죄송합니다. 이 페이지에 접근할 권한이 없습니다.
          <br />
          로그인 정보가 맞는지, 허용된 역할인지 확인해 주세요.
        </p>

        {/* 버튼 그룹 */}
        <div className="button-group">
          <Button variant="primary" onClick={() => navigate("/home")}>
            홈으로 돌아가기 →
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            이전 페이지
          </Button>
        </div>

        {/* 추가 도움말 */}
        <p className="help-text">
          문제가 계속되면 관리자에게 문의해주세요.
        </p>
      </div>
    </div>
  );
}
