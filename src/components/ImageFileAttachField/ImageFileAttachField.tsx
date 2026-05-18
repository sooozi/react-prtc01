import type { ImageFileAttachFieldProps } from "./types";
import { ImageFileAttachFieldCreate } from "./variants/Create";
import { ImageFileAttachFieldUnifiedEdit } from "./variants/UnifiedEdit";

export type { ImageFileAttachFieldProps } from "./types";

export function ImageFileAttachField(props: ImageFileAttachFieldProps) {
  if ("unifiedRows" in props) {
    return <ImageFileAttachFieldUnifiedEdit {...props} />; // 게시글 수정 
  }
  return <ImageFileAttachFieldCreate {...props} />; // 게시글 작성
}
