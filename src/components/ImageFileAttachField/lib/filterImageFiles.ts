import { partitionFileListByAttachmentAllowlist } from "./attachmentAllowlist";

/** 파일 입력에서 허용 확장자·MIME만 남김 (화이트리스트) */
export function filterImageFiles(fileList: FileList | null): File[] {
  return partitionFileListByAttachmentAllowlist(fileList).allowed;
}

export { partitionFileListByAttachmentAllowlist } from "./attachmentAllowlist";
