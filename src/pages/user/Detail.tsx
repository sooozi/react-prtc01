import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { selectUserDetail, type UserItem } from "@/api/user";
import { Badge, Button, LoadingState } from "@/components";
import "@/pages/post/Detail.scss";
import "@/pages/user/Detail.scss";

/** 목 데이터용 — userId 기준으로 안정적인 가입일 문자열 (데모 표시) */
function demoJoinedLabel(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i += 1) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  const y = 2019 + (h % 6);
  const m = 1 + ((h >> 3) % 12);
  const d = 1 + ((h >> 7) % 28);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

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

  const joinedLabel = useMemo(
    () => (user ? demoJoinedLabel(user.userId) : ""),
    [user]
  );

  const showLoading = loading && !invalidId;
  const displayError = invalidId ? "사용자 아이디가 필요합니다." : error;
  const showErrorSection = invalidId || error;

  return (
    <div className="post-detail-page">
      <div className="post-detail-header">
        <Badge>👤 Detail</Badge>
        <h1 className="title">사용자 상세</h1>
      </div>

      <div className="post-detail-actions">
        <Button variant="secondary" size="sm" onClick={() => navigate("/user/list")}>
          목록
        </Button>
      </div>

      <div className="post-detail-card">
        {showLoading ? (
          <LoadingState message="불러오는 중..." variant="compact" />
        ) : showErrorSection ? (
          <div className="detail-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{displayError}</span>
            {!invalidId && (
              <Button variant="secondary" size="sm" onClick={() => navigate("/user/list")}>
                목록으로
              </Button>
            )}
          </div>
        ) : user ? (
          <>
            <div className="detail-meta">
              <span className="detail-id">{user.userId}</span>
              <span className="detail-author">{user.userSe}</span>
              <span className="detail-date">{user.userJbgdNm}</span>
            </div>

            <h2 className="detail-title">{user.userFlnm}</h2>

            <p className="user-detail-lead">
              <strong>{user.userFlnm}</strong>님은 <strong>{user.userJbgdNm}</strong> 직급의{" "}
              <strong>{user.userSe}</strong> 계정입니다.
              {user.eml
                ? " 아래 연락처로 메일을 보낼 수 있습니다."
                : " 등록된 이메일이 없어 메일 연락은 불가합니다."}
            </p>

            <h3 className="user-detail-subheading">상세 정보</h3>
            <dl className="user-detail-spec">
              <div className="user-detail-spec__row">
                <dt>아이디</dt>
                <dd>{user.userId}</dd>
              </div>
              <div className="user-detail-spec__row">
                <dt>이름</dt>
                <dd>{user.userFlnm}</dd>
              </div>
              <div className="user-detail-spec__row">
                <dt>회원 구분</dt>
                <dd>{user.userSe}</dd>
              </div>
              <div className="user-detail-spec__row">
                <dt>직급</dt>
                <dd>{user.userJbgdNm}</dd>
              </div>
              <div className="user-detail-spec__row">
                <dt>가입일</dt>
                <dd>{joinedLabel} <span className="user-detail-spec__hint">(데모)</span></dd>
              </div>
            </dl>

            <h3 className="user-detail-subheading">연락처</h3>
            <div className="user-detail-contact detail-content">
              {user.eml ? (
                <>
                  이메일{" "}
                  <a className="user-detail-mailto" href={`mailto:${user.eml}`}>
                    {user.eml}
                  </a>
                </>
              ) : (
                "등록된 이메일이 없습니다."
              )}
            </div>

            <div className="user-detail-aside">
              <p className="user-detail-aside__title">안내</p>
              <p className="user-detail-aside__text">
                표시되는 사용자 정보는 연습용 목(mock) 데이터입니다. 실제 서비스에서는 인사·권한
                시스템과 연동된 필드가 노출됩니다.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
