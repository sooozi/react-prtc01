import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, LoadingState } from "@/components";
import { getMyPostList, BoardApiError } from "@/api/board/boardApi";
import type { Post } from "@/api/board";
import "@/pages/user/MyPage.scss";

// 말줄임이 난 경우에만 `title`을 붙여 브라우저 기본 툴팁으로 전체 제목 표시
function MypagePostTitle({ title, className }: { title: string; className: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // 말줄임이 난 경우에만 툴팁 표시
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    // span DOM 가져오기
    const el = ref.current;
    if (!el) return;

    // 말줄임이 난 경우에만 툴팁 표시
    const measure = () => {
      setIsTruncated(el.scrollWidth > el.clientWidth + 0.5);
    };

    // 말줄임이 난 경우에만 툴팁 표시
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [title]);

  return (
    <span ref={ref} className={className} title={isTruncated ? title : undefined}>
      {title}
    </span>
  );
}

export default function MyPage() {
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  // 내가 작성한 목록 조회
  useEffect(() => {
    // userId가 없으면 목록 비우기
    if (!userId) {
      setPosts([]);
      setPostsLoading(false);
      setPostsError("");
      return;
    }

    let cancelled = false;

    // 내가 작성한 목록 조회
    const fetchData = async () => {
      setPostsLoading(true);
      setPostsError("");
      try {
        const data = await getMyPostList(userId);
        if (!cancelled) setPosts(data);
      } catch (e) {
        // 취소되지 않았으면 목록 비우기
        if (!cancelled) {
          setPosts([]);
          // 오류 메시지 설정
          setPostsError(
            e instanceof BoardApiError ? e.message : "목록을 불러오지 못했습니다."
          );
        }
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    };

    fetchData();

    // 컴포넌트 언마운트 시 취소 설정
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="mypage-page">
      <section className="mypage-section">
        <header className="mypage-header">
          <Badge>👤 MyPage</Badge>
          <h1 className="title">
            안녕하세요, <span className="highlight">{userName ?? "회원"}</span>님
          </h1>
          <p className="subtitle">회원 정보와 작성한 글을 한곳에서 확인하세요.</p>
        </header>

        <div className="mypage-profile-grid">
          <div className="mypage-card">
            <h2 className="mypage-card__title">기본 정보</h2>
            <div className="mypage-card__row">
              <span className="mypage-card__label">아이디</span>
              <span className="mypage-card__value">{userId ?? "-"}</span>
            </div>
            <div className="mypage-card__row">
              <span className="mypage-card__label">이름</span>
              <span className="mypage-card__value">{userName ?? "-"}</span>
            </div>
          </div>

          <div className="mypage-card">
            <h2 className="mypage-card__title">계정 정보</h2>
            <div className="mypage-card__row">
              <span className="mypage-card__label">회원 유형</span>
              <span className="mypage-card__value">일반 회원</span>
            </div>
            <div className="mypage-card__row">
              <span className="mypage-card__label">계정 상태</span>
              <span className="mypage-card__value mypage-card__value--ok">정상</span>
            </div>
          </div>
        </div>

        <div className="mypage-card mypage-card--posts">
          <div className="mypage-posts-head">
            <h2 className="mypage-card__title mypage-card__title--inline">내가 쓴 글</h2>
            {!postsLoading && posts.length > 0 && (
              <span className="mypage-posts-count">{posts.length}건</span>
            )}
          </div>

          {postsLoading && (
            <LoadingState message="작성 글을 불러오는 중..." variant="compact" className="mypage-posts-loading" />
          )}

          {!postsLoading && postsError && (
            <p className="mypage-posts-empty mypage-posts-empty--error" role="alert">
              {postsError}
            </p>
          )}

          {!postsLoading && !postsError && !userId && (
            <p className="mypage-posts-empty">로그인 후 작성 글을 확인할 수 있습니다.</p>
          )}

          {!postsLoading && !postsError && userId && posts.length === 0 && (
            <p className="mypage-posts-empty">아직 작성한 글이 없습니다.</p>
          )}

          {!postsLoading && !postsError && posts.length > 0 && (
            <ul className="mypage-posts-list">
              {posts.map((post) => (
                <li key={post.postNumber}>
                  <Link className="mypage-post-link" to={`/post/detail?id=${post.postNumber}`}>
                    <MypagePostTitle title={post.title} className="mypage-post-link__title" />
                    <span className="mypage-post-link__meta">
                      <time dateTime={post.regDt}>{post.regDt}</time>
                      {post.inqCnt != null && (
                        <span className="mypage-post-link__views">조회 {post.inqCnt}</span>
                      )}
                    </span>
                    <span className="mypage-post-link__chevron" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mypage-actions">
          <Button variant="secondary" to="/user/list">
            사용자 목록
          </Button>
          <Button variant="primary" to="/home">
            홈으로
          </Button>
        </div>
      </section>
    </div>
  );
}
