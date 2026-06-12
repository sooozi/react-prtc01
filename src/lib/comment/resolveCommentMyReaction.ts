import type {
  CommentListItem,
  CommentReactionType,
  CommentUserReaction,
} from "@/api/board/boardApi.types";

/** GET /comments — 로그인 사용자의 현재 반응 (필드명 API 버전별 상이) */
export function resolveCommentMyReaction(
  comment: Pick<CommentListItem, "myReactionType" | "reactionType">,
): CommentUserReaction | null {
  const raw = comment.myReactionType ?? comment.reactionType;
  return raw === "LIKE" || raw === "DISLIKE" ? raw : null;
}

/** 클릭한 버튼 + 현재 반응 → PATCH reactionType */
export function resolveReactionRequestType(
  current: CommentUserReaction | null,
  button: CommentUserReaction,
): CommentReactionType {
  if (button === "LIKE") {
    return current === "LIKE" ? "LIKE_CANCEL" : "LIKE";
  }
  return current === "DISLIKE" ? "DISLIKE_CANCEL" : "DISLIKE";
}

/** PATCH reactionType → 반응 후 UI 상태 */
export function resolveMyReactionAfterRequest(
  requestType: CommentReactionType,
): CommentUserReaction | null {
  switch (requestType) {
    case "LIKE":
      return "LIKE";
    case "LIKE_CANCEL":
      return null;
    case "DISLIKE":
      return "DISLIKE";
    case "DISLIKE_CANCEL":
      return null;
    default:
      return null;
  }
}
