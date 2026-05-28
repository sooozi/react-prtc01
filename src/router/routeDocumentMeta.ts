/** 브라우저 탭·스크린 리더용 사이트 접미사 (로고 alt 등과 통일) */
export const SITE_DOCUMENT_TITLE = "MyViteProject";

export type RouteDocumentMeta = {
  /** <title> 전체 문자열 */
  title: string;
  /** aria-live 영역에 넣을 짧은 안내 (스크린 리더) */
  announce: string;
};

const withSuffix = (pageTitle: string): string =>
  pageTitle.includes(SITE_DOCUMENT_TITLE) ? pageTitle : `${pageTitle} | ${SITE_DOCUMENT_TITLE}`;

/** pathname 기준 (쿼리는 별도 effect에서 동일 pathname 재안내 가능) */
export function getRouteDocumentMeta(pathname: string): RouteDocumentMeta {
  switch (pathname) {
    case "/":
    case "/home":
      return {
        title: withSuffix("홈"),
        announce: "홈 화면으로 이동했습니다.",
      };
    case "/auth/login":
      return {
        title: withSuffix("로그인"),
        announce: "로그인 페이지로 이동했습니다.",
      };
    case "/auth/signup":
      return {
        title: withSuffix("회원가입"),
        announce: "회원가입 페이지로 이동했습니다.",
      };
    case "/about":
      return {
        title: withSuffix("소개"),
        announce: "소개 페이지로 이동했습니다.",
      };
    case "/style-guide":
      return {
        title: withSuffix("스타일 가이드"),
        announce: "스타일 가이드 페이지로 이동했습니다.",
      };
    case "/user/list":
      return {
        title: withSuffix("사용자 목록"),
        announce: "사용자 목록으로 이동했습니다.",
      };
    case "/user/detail":
      return {
        title: withSuffix("사용자 상세"),
        announce: "사용자 상세 페이지로 이동했습니다.",
      };
    case "/user/mypage":
      return {
        title: withSuffix("마이페이지"),
        announce: "마이페이지로 이동했습니다.",
      };
    case "/post/list":
      return {
        title: withSuffix("게시판"),
        announce: "게시판 목록으로 이동했습니다.",
      };
    case "/post/detail":
      return {
        title: withSuffix("게시글"),
        announce: "게시글 상세 페이지로 이동했습니다.",
      };
    case "/post/write":
      return {
        title: withSuffix("글쓰기"),
        announce: "글쓰기 페이지로 이동했습니다.",
      };
    case "/post/update":
      return {
        title: withSuffix("게시글 수정"),
        announce: "게시글 수정 페이지로 이동했습니다.",
      };
    case "/schedule":
      return {
        title: withSuffix("일정"),
        announce: "일정 페이지로 이동했습니다.",
      };
    case "/forbidden":
      return {
        title: withSuffix("접근 제한"),
        announce: "접근이 제한된 페이지입니다.",
      };
    case "/not-found":
      return {
        title: withSuffix("페이지 없음"),
        announce: "페이지를 찾을 수 없습니다.",
      };
    default:
      return {
        title: SITE_DOCUMENT_TITLE,
        announce: "페이지가 바뀌었습니다.",
      };
  }
}
