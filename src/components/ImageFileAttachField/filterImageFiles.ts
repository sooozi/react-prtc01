/** 파일 입력에서 이미지 MIME만 남김 */
export function filterImageFiles(fileList: FileList | null): File[] {
  if (!fileList || fileList.length === 0) return [];
  return Array.from(fileList).filter((f) => f.type.startsWith("image/"));
}
