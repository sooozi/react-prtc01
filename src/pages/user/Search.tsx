import { useEffect, useState } from "react";
import { selectUserList, type UserItem } from "@/api/user";
import { Badge, LoadingState, Pagination } from "@/components";
import { usePagination } from "@/hooks/usePagination";
import { useUrlQueryPage } from "@/hooks/useUrlQueryPage";
import "@/pages/user/Search.scss";

export default function UserSearch() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { currentPage, setCurrentPage } = useUrlQueryPage();
  const { totalItems, setTotalItems, totalPages, pageSize } = usePagination();

  useEffect(() => {
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
  }, [currentPage, pageSize, setCurrentPage, setTotalItems]);

  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="search-page">
      <div className="list-page-head">
        <div className="title-block">
          <Badge>👥 User List</Badge>
          <h1 className="title">사용자 목록</h1>
          <p className="subtitle">
            전체 <strong>{totalItems}</strong>명의 사용자
          </p>
        </div>
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
          <>
            <table className="table search-page__table-desktop">
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

            <ul className="search-user-cards">
              {users.map((user, index) => (
                <li key={`card-${user.eml}-${index}`} className="search-user-card">
                  <div className="search-user-card__head">
                    <span className="search-user-card__index">{startIndex + index + 1}</span>
                    <span className="search-user-card__name">{user.userFlnm}</span>
                  </div>
                  <dl className="search-user-card__meta">
                    <div className="search-user-card__row">
                      <dt>직급</dt>
                      <dd>{user.userJbgdNm}</dd>
                    </div>
                    <div className="search-user-card__row">
                      <dt>이메일</dt>
                      <dd className="search-user-card__email">{user.eml}</dd>
                    </div>
                    <div className="search-user-card__row">
                      <dt>구분</dt>
                      <dd>
                        <span
                          className={user.userSe === "관리자" ? "admin-badge" : "user-badge"}
                        >
                          {user.userSe}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </>
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
