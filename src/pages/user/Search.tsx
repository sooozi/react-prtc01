import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { selectUserList } from "@/api/userApi";
import type { UserItem } from "@/api/userApi";
import { LoadingState, Pagination } from "@/components";
import { usePagination } from "@/hooks/usePagination";
import "@/pages/user/Search.scss";

export default function UserSearch() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { currentPage, setCurrentPage, totalItems, setTotalItems, totalPages, pageSize } =
    usePagination();

  // 로그인 토큰 확인
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      navigate("/auth/login", { state: { toast: "로그인이 필요합니다" }, replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // 사용자 목록 조회
        const res = await selectUserList({
          page: currentPage,
          size: pageSize,
        });

        // 응답 데이터 파싱
        const payload = res?.data;

        // 사용자 목록 설정
        setUsers(payload?.data ?? []);
        const total = payload?.totalItemSize ?? 0;
        // 전체 사용자 수 설정
        setTotalItems(total);

        // 전체 페이지 수 계산
        const computedTotalPages = Math.max(1, Math.ceil(total / pageSize));
        // 현재 페이지가 전체 페이지 수보다 크면 마지막 페이지로 이동
        if (currentPage > computedTotalPages) setCurrentPage(computedTotalPages);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "사용자 목록 조회 실패";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, setCurrentPage, setTotalItems, navigate]);

  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="search-page">
      <div className="title-section">
        <span className="badge">👥 User List</span>
        <h1 className="title">사용자 목록</h1>
        <p className="subtitle">
          전체 <strong>{totalItems}</strong>명의 사용자
        </p>
      </div>

      <div className="table-card">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <span className="error-title">연결 오류</span>
            <span className="error-message">{error}</span>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <span className="empty-text">등록된 사용자가 없습니다.</span>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="th th-number">번호</th>
                <th className="th">이름</th>
                <th className="th">직급</th>
                <th className="th">이메일</th>
                <th className="th">구분</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={`${user.eml}-${index}`} className="tr">
                  <td className="td td-number">{startIndex + index + 1}</td>
                  <td className="td">{user.userFlnm}</td>
                  <td className="td">{user.userJbgdNm}</td>
                  <td className="td">{user.eml}</td>
                  <td className="td">{user.userSe}</td>
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
