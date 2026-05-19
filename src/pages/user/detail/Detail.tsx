import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { selectUserDetail, type UserItem } from "@/api/user";
import { Button, LoadingState, PageHeader } from "@/components";
import { pickProfileImage } from "@/pages/user/detail/profileImages";
import "@/pages/post/detail/Detail.scss";
import "./Detail.scss";

export default function UserDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = searchParams.get("userId")?.trim() ?? "";
  const invalidId = !userId;
  const profileImageSrc = useMemo(() => pickProfileImage(userId), [userId]);

  useEffect(() => {
    if (invalidId) return;

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
    <div className="post-detail-page">
      <PageHeader badge="👤 Detail" title="사용자 상세" variant="centered" />

      <div className="post-detail-actions">
        <Button variant="secondary" size="sm" onClick={() => navigate("/user/list")}>
          목록
        </Button>
      </div>

      <div className="post-detail-card user-detail">
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
            <div className="user-detail-hero">
              <figure className="user-detail-avatar-wrap">
                <img
                  className="user-detail-avatar"
                  src={profileImageSrc}
                  alt={`${user.userFlnm} 프로필`}
                  width={80}
                  height={80}
                  decoding="async"
                />
              </figure>
              <div className="user-detail-hero__body">
                <div className="detail-meta">
                  <span className="detail-id">{user.userId}</span>
                  <span className="detail-author">{user.userSe}</span>
                  <span className="detail-date">{user.userJbgdNm}</span>
                </div>
                <h2 className="detail-title">{user.userFlnm}</h2>
              </div>
            </div>

            <div className="user-detail-spec-wrap">
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
              </dl>
            </div>

            <div className="user-detail-contact-block">
              <h3 className="user-detail-subheading user-detail-subheading--after-spec">연락처</h3>
              <div className="user-detail-contact">
                {user.eml ? (
                  <div className="user-detail-contact__row">
                    <span className="user-detail-contact__label">이메일</span>
                    <a className="user-detail-mailto" href={`mailto:${user.eml}`}>
                      {user.eml}
                    </a>
                  </div>
                ) : (
                  <p className="user-detail-contact__empty">등록된 이메일이 없습니다.</p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
