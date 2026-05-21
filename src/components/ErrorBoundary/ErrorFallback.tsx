import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button/Button";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import "@/components/ErrorBoundary/ErrorFallback.scss";

export type ErrorFallbackProps = {
  error: Error;
  onReset: () => void;
};

/**
 * Error Boundary가 잡은 렌더링 오류용 폴백 UI (404/403 페이지와 톤 맞춤)
 */
export default function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="error-fallback" role="alert">
      <div className="error-fallback__content">
        <div className="error-fallback__icon-wrap">
          <span className="error-fallback__icon" aria-hidden>
            ⚠️
          </span>
        </div>

        <span className="error-fallback__code">Error</span>

        <PageHeader
          badge="Unexpected Error"
          title={
            <>
              화면을 불러오는 중 <span className="error-fallback__accent">문제가 발생했습니다</span>
            </>
          }
          titleClassName="error-fallback__title"
          subtitle={
            <>
              일시적인 오류일 수 있습니다. 다시 시도하거나 홈으로 이동해 주세요.
              {import.meta.env.DEV && error.message ? (
                <>
                  <br />
                  <span className="error-fallback__dev-message">{error.message}</span>
                </>
              ) : null}
            </>
          }
          subtitleClassName="error-fallback__desc"
          variant="inline"
          as="div"
        />

        <div className="error-fallback__actions">
          <Button type="button" variant="primary" onClick={onReset}>
            다시 시도
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/home")}>
            홈으로 돌아가기 →
          </Button>
        </div>

        <p className="error-fallback__hint">문제가 계속되면 페이지를 새로고침해 주세요.</p>
      </div>
    </div>
  );
}
