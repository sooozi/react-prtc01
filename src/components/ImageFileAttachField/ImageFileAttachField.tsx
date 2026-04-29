import type { ImageFileAttachFieldProps } from "./ImageFileAttachField.types";
import { ImageFileAttachFieldCreate } from "./ImageFileAttachFieldCreate";
import { ImageFileAttachFieldUnifiedEdit } from "./ImageFileAttachFieldUnifiedEdit";

export type { ImageFileAttachFieldProps } from "./ImageFileAttachField.types";

export function ImageFileAttachField(props: ImageFileAttachFieldProps) {
  if ("unifiedRows" in props) {
    return <ImageFileAttachFieldUnifiedEdit {...props} />; // 게시글 수정 
  }
  return <ImageFileAttachFieldCreate {...props} />; // 게시글 작성
}
