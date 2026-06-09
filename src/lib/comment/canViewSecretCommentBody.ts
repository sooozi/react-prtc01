type CanViewSecretCommentBodyParams = {
  secretYn?: "Y" | "N";
  rgtrId?: string;
  currentUserId: string | null;
  postOwnerUserId?: string;
};

// 비밀댓글: 게시글 작성자·댓글 작성자만 본문 열람
export function canViewSecretCommentBody({
  secretYn,
  rgtrId,
  currentUserId,
  postOwnerUserId,
}: CanViewSecretCommentBodyParams): boolean {
  if (secretYn !== "Y") return true;
  if (!currentUserId) return false;
  if (rgtrId && rgtrId === currentUserId) return true;
  if (postOwnerUserId && postOwnerUserId === currentUserId) return true;
  return false;
}
