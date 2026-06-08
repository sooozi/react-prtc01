type CanViewSecretCommentBodyParams = {
  isSecret?: boolean;
  commentAuthorUserId?: string;
  currentUserId: string | null;
  postOwnerUserId?: string;
};

// 비밀댓글: 게시글 작성자·댓글 작성자만 본문 열람
export function canViewSecretCommentBody({
  isSecret,
  commentAuthorUserId,
  currentUserId,
  postOwnerUserId,
}: CanViewSecretCommentBodyParams): boolean {
  if (!isSecret) return true;
  if (!currentUserId) return false;
  if (commentAuthorUserId && commentAuthorUserId === currentUserId) return true;
  if (postOwnerUserId && postOwnerUserId === currentUserId) return true;
  return false;
}