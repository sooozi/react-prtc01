/** 게시글 글쓰기·수정 폼 필드별 검증 메시지 */
export type PostFormFieldErrors = {
  title?: string;
  content?: string;
  attach?: string;
};

// 게시글 글쓰기·수정 폼 필드별 검증 메시지 초기화
export function clearPostFormFieldError(
  errors: PostFormFieldErrors,
  field: keyof PostFormFieldErrors,
): PostFormFieldErrors {
  if (!errors[field]) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}
