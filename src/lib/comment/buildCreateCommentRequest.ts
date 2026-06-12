import type { CommentListItem, CreateCommentRequest } from "@/api/board/boardApi.types";

/** 해당 댓글이 최상위 댓글인지 판별 */
export function isRootComment(parentCommentId: number | null | undefined): boolean {
  return parentCommentId == null || parentCommentId === 0;
}

type BuildReplyParams = {
  postNumber: number;
  content: string;
  parent: Pick<CommentListItem, "commentId" | "parentCommentId" | "rootCommentId" | "depth">;
  secretYn: "Y" | "N";
};

/** POST /comments — 최상위 댓글 */
export function buildRootCommentRequest(
  postNumber: number,
  content: string,
  secretYn: "Y" | "N",
): CreateCommentRequest {
  return {
    postNumber,
    content,
    parentCommentId: null,
    rootCommentId: null,
    depth: 0,
    secretYn,
  };
}

/** POST /comments — 답글(대댓글) */
export function buildReplyCommentRequest({
  postNumber,
  content,
  parent,
  secretYn,
}: BuildReplyParams): CreateCommentRequest {
  const parentIsRoot = isRootComment(parent.parentCommentId);

  const rootCommentId = parentIsRoot
    ? parent.commentId
    : (parent.rootCommentId ?? parent.commentId);

  return {
    postNumber,
    content,
    parentCommentId: parent.commentId,
    rootCommentId,
    depth: parent.depth + 1,
    secretYn,
  };
}
