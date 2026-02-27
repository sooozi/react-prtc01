// src/pages/user/Search.tsx
import { useEffect, useState } from "react";
import { selectUserList } from "@/api/userApi";
import type { UserItem } from "@/api/userApi";
import Pagination from "@/components/Pagination/Pagination";
import { usePagination } from "@/hooks/usePagination";
import "./Search.scss";

const USER_LIST_SIZE = 10;

export default function UserSearch() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { currentPage, setCurrentPage, totalItems, setTotalItems, totalPages } =
    usePagination(USER_LIST_SIZE);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await selectUserList({
          page: currentPage,
          size: USER_LIST_SIZE,
        });

        // res.data 안에 { itemSize, pageSize, totalItemSize, data }
        const payload = res?.data;

        setUsers(payload?.data ?? []);
        const total = payload?.totalItemSize ?? 0;
        setTotalItems(total);

        // (안전장치, 선택) totalItems가 줄어서 currentPage가 범위를 넘는 상황 방어
        const computedTotalPages = Math.max(1, Math.ceil(total / USER_LIST_SIZE));
        if (currentPage > computedTotalPages) setCurrentPage(computedTotalPages);

      } catch (e: unknown) { // 실패 처리
        const message = e instanceof Error ? e.message : "사용자 목록 조회 실패";
        setError(message);
      } finally { // 로딩 상태 종료
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, setCurrentPage, setTotalItems]);

  const startIndex = (currentPage - 1) * USER_LIST_SIZE;

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
