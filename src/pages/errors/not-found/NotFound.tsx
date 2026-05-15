import { useNavigate } from "react-router-dom";
import { Button, PageHeader } from "@/components";
import "./NotFound.scss";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon-wrap">
          <span className="not-found-icon" aria-hidden>
            🔍
          </span>
        </div>

        <span className="not-found-code">404</span>

        <PageHeader
          badge="404 Not Found"
          title={
            <>
              페이지를 <span className="not-found-accent">찾을 수 없습니다</span>
            </>
          }
          titleClassName="not-found-title"
          subtitle={
            <>
              요청하신 주소가 존재하지 않거나 삭제되었을 수 있습니다.
              <br />
              URL을 다시 확인해 주세요.
            </>
          }
          subtitleClassName="not-found-desc"
          variant="inline"
          as="div"
        />

        <div className="not-found-actions">
          <Button variant="primary" onClick={() => navigate("/home")}>
            홈으로 돌아가기 →
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            이전 페이지
          </Button>
        </div>

        <p className="not-found-hint">잘못된 링크라면 관리자에게 알려 주세요.</p>
      </div>
    </div>
  );
}
