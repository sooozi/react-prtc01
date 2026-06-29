/** Lenis 스무스 스크롤을 켜는 공개 랜딩형 페이지 */
export const LENIS_PATHS = new Set(["/home", "/testmain", "/about", "/style-guide"]);

export function isLenisRoute(pathname: string): boolean {
  return LENIS_PATHS.has(pathname);
}
