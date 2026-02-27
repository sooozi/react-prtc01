import { useEffect, useState } from "react";
import { selectBoardList } from "@/api/boardApi";
import type { BoardPostItem } from "@/api/boardApi";
import Pagination from "@/components/Pagination/Pagination";
import { usePagination } from "@/hooks/usePagination";
import "./Board.scss";

const BOARD_LIST_SIZE = 10;

export default function Board() {
  const [posts, setPosts] = useState<BoardPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { currentPage, setCurrentPage, totalItems, setTotalItems, totalPages } =
    usePagination(BOARD_LIST_SIZE);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await selectBoardList({
          page: currentPage,
          size: BOARD_LIST_SIZE,
        });

        const payload = res?.data;

        setPosts(payload?.data ?? []);
        const total = payload?.totalItemSize ?? 0;
        setTotalItems(total);

        const computedTotalPages = Math.max(1, Math.ceil(total / BOARD_LIST_SIZE));
        if (currentPage > computedTotalPages) setCurrentPage(computedTotalPages);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "게시글 목록 조회 실패";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, setCurrentPage, setTotalItems]);

  const startIndex = (currentPage - 1) * BOARD_LIST_SIZE;

  return (
    <div className="board-page">
      <div className="title-section">
        <span className="badge">📋 Board</span>
        <h1 className="title">게시판</h1>
        <p className="subtitle">
          전체 <strong>{totalItems}</strong>개의 게시글
        </p>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>데이터를 불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <span className="error-title">연결 오류</span>
            <span className="error-message">{error}</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <span className="empty-text">등록된 게시글이 없습니다.</span>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="th th-number">번호</th>
                <th className="th th-category">구분</th>
                <th className="th th-title">제목</th>
                <th className="th">작성자</th>
                <th className="th th-date">작성일</th>
                <th className="th th-number">조회</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <tr key={post.id} className="tr">
                  <td className="td td-number">{startIndex + index + 1}</td>
                  <td className="td td-category">
                    <span className="category-badge">{post.category}</span>
                  </td>
                  <td className="td td-title">{post.title}</td>
                  <td className="td">{post.author}</td>
                  <td className="td td-date">{post.createdAt}</td>
                  <td className="td td-number">{post.viewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
