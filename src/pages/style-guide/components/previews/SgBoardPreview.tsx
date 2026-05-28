import { Button } from "@/components";

export function SgBoardPreview() {
  return (
    <div className="sg-board-preview">
      <div className="sg-board-preview__toolbar">
        <span className="sg-board-preview__title">게시판</span>
        <Button variant="primary" size="sm">
          글쓰기
        </Button>
      </div>
      <table className="sg-board-preview__table">
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">제목</th>
            <th scope="col">작성자</th>
            <th scope="col">조회</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>42</td>
            <td>Style Guide 페이지 오픈</td>
            <td>admin</td>
            <td>128</td>
          </tr>
          <tr>
            <td>41</td>
            <td>디자인 토큰 정리 노트</td>
            <td>dev</td>
            <td>86</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
