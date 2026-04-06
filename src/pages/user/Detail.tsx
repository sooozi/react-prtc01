import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { selectUserDetail, type UserItem } from "@/api/user";
import { Badge, Button, LoadingState } from "@/components";
import "@/pages/user/Detail.scss";

export default function UserDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = searchParams.get("userId")?.trim() ?? "";
  const invalidId = !userId;

  useEffect(() => {
    if (invalidId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await selectUserDetail(userId);
        if (cancelled) return;
        if (!data) {
          setError("해당 사용자를 찾을 수 없습니다.");
          setUser(null);
        } else {
          setUser(data);
          setError("");
        }
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "사용자 정보를 불러오지 못했습니다.");
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, invalidId]);

  const showLoading = loading && !invalidId;
  const displayError = invalidId ? "사용자 아이디가 필요합니다." : error;
  const showErrorSection = invalidId || error;

  return (
    <div className="user-detail-page">
      <div className="user-detail-header">
        <Badge>👤 Detail</Badge>
        <h1 className="title">사용자 상세</h1>
      </div>

      <div className="user-detail-actions">
        <Button variant="secondary" size="sm" onClick={() => navigate("/user/list")}>
          목록
        </Button>
      </div>

      <div className="user-detail-card">
        {showLoading ? (
          <LoadingState message="불러오는 중..." variant="compact" />
        ) : showErrorSection ? (
          <div className="user-detail-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{displayError}</span>
          </div>
        ) : user ? (
          <>
            <div className="user-detail-meta">
              <span className="user-detail-id">{user.userId}</span>
              <span className="user-detail-se">{user.userSe}</span>
              <span className="user-detail-rank">{user.userJbgdNm}</span>
            </div>
            <h2 className="user-detail-title">{user.userFlnm}</h2>
            <span className="user-detail-email-label">이메일</span>
            <div className="user-detail-content">{user.eml || ""}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}
