import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getPostDetail,
  getPostFiles,
  deletePost,
  viewCountUp,
} from "@/api/board";
import type { PostAttachmentItem, PostDetail } from "@/api/board";
import { Badge, Button, Confirm, LoadingState } from "@/components";
import { listReturnPathFromFromQuery, postUpdatePath } from "@/pages/post/postDetailFromQuery";
import "@/pages/post/Detail.scss";

export default function Detail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listReturnPath = listReturnPathFromFromQuery(searchParams.get("from"));
  const [post, setPost] = useState<PostDetail | null>(null);
  const [attachments, setAttachments] = useState<PostAttachmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const idRaw = searchParams.get("id"); // 게시글 번호
  const postNumber = idRaw ? parseInt(idRaw, 10) : NaN; // 게시글 번호 파싱
  const invalidId = Number.isNaN(postNumber) || postNumber < 1; // 게시글 번호 유효성 검사


  // [게시글 상세 조회]
  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    // 1) 조회수 증가 먼저 호출 
    // 2) 상세 조회 (둘 다 서버 값 사용해 목록·상세 조회수 일치)
    (async () => {
      // [조회수 증가]
      try {
        await viewCountUp(postNumber);
      } catch (e) {
        if (import.meta.env.DEV) console.warn("조회수 증가 API 실패:", e);
      }
      // 조회수 증가 실패 시 취소 플래그 확인
      if (cancelled) return;

      // [게시글 상세 조회] + [첨부 목록] (병렬)
      try {
        const [data, files] = await Promise.all([
          getPostDetail(postNumber),
          getPostFiles(postNumber).catch(() => [] as PostAttachmentItem[]),
        ]);
        if (cancelled) return;
        if (data == null) {
          setPost(null);
          setAttachments([]);
        } else {
          setPost(data);
          setAttachments(
            [...files].sort((a, b) => a.sortOrder - b.sortOrder)
          );
        }
      } finally {
        // 게시글 상세 조회 완료 시 로딩 상태 초기화
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postNumber, invalidId]);

  const showLoading = loading && !invalidId;
  const missingAfterLoad = !showLoading && !post && !invalidId;
  const displayError = invalidId
    ? "잘못된 게시글 번호입니다."
    : missingAfterLoad
      ? "게시글을 불러오지 못했습니다."
      : "";
  const showErrorSection = invalidId || missingAfterLoad;

  // [수정 버튼 노출] 해당 포스트 작성자와 로그인 사용자가 같을 때
  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  // 게시글, 로그인, 작성자와 사용자가 동일한 경우 수정 버튼 노출(boolean)
  const canEdit =
    !!post && !!currentUserId && post.ownerUserId === currentUserId;

  // [삭제 버튼 클릭 시] 컨펌 후 게시글 삭제
  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    setDeleteLoading(true);
    try {
      const ok = await deletePost(postNumber);
      if (ok) {
        navigate(
          listReturnPath === "/post/list" ? "/post/list?page=1" : listReturnPath,
          { replace: true }
        );
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // 게시글 상세 페이지 렌더링
  return (
    <div className="post-detail-page">
      {/* 게시글 상세 헤더 */}
      <div className="post-detail-header">
        <Badge>📄 Detail</Badge>
        <h1 className="title">게시글 상세</h1>
      </div>

      <div className="post-detail-actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            navigate(listReturnPath === "/post/list" ? "/post/list" : listReturnPath)
          }
          disabled={deleteLoading}
        >
          {listReturnPath === "/user/mypage" ? "마이페이지" : "목록"}
        </Button>
        {canEdit && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                navigate(postUpdatePath(postNumber, searchParams.get("from")))
              }
              disabled={deleteLoading}
            >
              수정
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteLoading}
            >
              {deleteLoading ? "삭제 중..." : "삭제"}
            </Button>
          </>
        )}
      </div>

      {/* 게시글 상세 콘텐츠 */}
      <div className="post-detail-card">
        {/* 로딩 상태 표시 */}
        {showLoading ? (
          <LoadingState message="불러오는 중..." variant="compact" />
        ) : showErrorSection ? (
          <div className="detail-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{displayError}</span>
          </div>
        ) : post ? (
          <>
            <div className="detail-meta">
              <span className="detail-id">#{post.postNumber}</span>
              <span className="detail-author">{post.rgtrInfo ?? "-"}</span>
              <span className="detail-date">{post.regDt}</span>
              <span className="detail-view">조회 {post.inqCnt ?? 0}</span>
            </div>
            <h2 className="detail-title">{post.title}</h2>
            <div className="detail-content">{post.content || "내용 없음"}</div>
            {attachments.length > 0 && (
              <section className="detail-attachments" aria-label="첨부파일">
                <h3 className="detail-attachments__heading">첨부파일</h3>
                <ul className="detail-attachments__list">
                  {attachments.map((file) => (
                    <li key={file.fileId} className="detail-attachments__item">
                      <span className="detail-attachments__icon" aria-hidden>
                        📎
                      </span>
                      <span className="detail-attachments__name">{file.fileName}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : null}
      </div>

      <Confirm
        open={showDeleteConfirm}
        message="삭제하시겠습니까?"
        variant="danger"
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
