import type { FileWithId, ImageFilePreviousEntry } from "./ImageFileAttachField.types";

// 첨부 파일 전체 파일명(확장자 포함) 최대 길이
export const MAX_ATTACHMENT_FILENAME_LENGTH = 300;

// 첨부 파일 전체 파일명(확장자 포함) 최대 길이 이내인지 판별
export function isAttachmentFileNameWithinLimit(fileName: string): boolean {
  return fileName.length <= MAX_ATTACHMENT_FILENAME_LENGTH;
}

/**
 * 마지막 `.` 기준 이름 + 확장자(소문자)로 동일 첨부 여부 판별
 * - `a.png` / `a.jpg` 는 서로 다름(베이스+확 조합이 다름)
 * - `a.jpg` / `a.JPG` / `A.jpg` 는 모두 같음(베이스·확 모두 소문자로 맞춰 비교)
 * - 확장자가 없으면(`.` 없음) 전체 이름(소문자)만 씀
 */
export function getAttachmentIdentityKey(fileName: string): string {
  const d = fileName.lastIndexOf(".");
  if (d <= 0) {
    return fileName.toLowerCase();
  }
  const base = fileName.slice(0, d);
  const ext = fileName.slice(d + 1);
  return `${base.toLowerCase()}\0${ext.toLowerCase()}`;
}

// 이미 `items`·`previous`·같은 배치 안에 동일(이름+확장자)가 있으면 `skip`, 나머지 `add`
export function partitionByAttachmentIdentity(
  newFiles: File[], 
  currentItems: FileWithId[],
  previous: ImageFilePreviousEntry[] | undefined
): { add: File[]; skip: File[] } { 
  const used = new Set<string>();
  for (const it of currentItems) {
    used.add(getAttachmentIdentityKey(it.file.name)); // 현재 첨부 파일 이름 추가
  }
  for (const p of previous ?? []) {
    used.add(getAttachmentIdentityKey(p.name)); // 기존 첨부 파일 이름 추가
  }
  const add: File[] = [];
  const skip: File[] = [];
  for (const f of newFiles) {
    const k = getAttachmentIdentityKey(f.name);
    if (used.has(k)) {
      skip.push(f);
      continue;
    }
    used.add(k);
    add.push(f);
  }
  return { add, skip };
}

// 파일 목록을 FileWithId 목록으로 변환
export function filesToItemsWithIds(files: File[]): FileWithId[] {
  return files.map((file) => ({ id: crypto.randomUUID(), file }));
}

// FileWithId 목록을 File 목록으로 변환
export function itemsToFiles(items: FileWithId[]): File[] {
  return items.map((i) => i.file);
}