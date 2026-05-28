import { ALLOWED_ATTACHMENT_EXTENSIONS_LABEL } from "./attachmentAllowlist";
import { MAX_ATTACHMENT_FILENAME_LENGTH } from "./fileAttachItemUtils";

const MESSAGE_NAME_MAX_LEN = 50;

export function truncateFileNameForMessage(name: string, maxLen = MESSAGE_NAME_MAX_LEN): string {
  return name.length > maxLen ? `${name.slice(0, maxLen)}…` : name;
}

export function splitFilesByMaxNameLength(files: File[]): {
  okLength: File[];
  tooLong: File[];
} {
  const okLength: File[] = [];
  const tooLong: File[] = [];
  for (const f of files) {
    if (f.name.length > MAX_ATTACHMENT_FILENAME_LENGTH) tooLong.push(f);
    else okLength.push(f);
  }
  return { okLength, tooLong };
}

export function buildTooLongNameMessages(tooLong: File[]): string[] {
  if (tooLong.length === 0) return [];

  if (tooLong.length === 1) {
    const shown = truncateFileNameForMessage(tooLong[0]!.name);
    return [
      `파일명(확장자 포함)은 ${MAX_ATTACHMENT_FILENAME_LENGTH}자 이하여야 합니다. 추가하지 않음: “${shown}”`,
    ];
  }

  return [
    `파일명(확장자 포함)이 ${MAX_ATTACHMENT_FILENAME_LENGTH}자를 넘는 ${tooLong.length}개는 추가하지 않았습니다.`,
  ];
}

export function buildRejectedAllowlistMessages(rejected: File[]): string[] {
  if (rejected.length === 0) return [];

  if (rejected.length === 1) {
    const shown = truncateFileNameForMessage(rejected[0]!.name);
    return [
      `허용되지 않는 파일 형식이라 추가하지 않았습니다. (${ALLOWED_ATTACHMENT_EXTENSIONS_LABEL}만 가능) “${shown}”`,
    ];
  }

  return [
    `허용되지 않는 파일 형식 ${rejected.length}개는 추가하지 않았습니다. (${ALLOWED_ATTACHMENT_EXTENSIONS_LABEL}만 가능)`,
  ];
}

export function buildDuplicateSkipMessage(skip: File[]): string | null {
  if (skip.length === 0) return null;

  const list =
    skip.length === 1
      ? `“${truncateFileNameForMessage(skip[0]!.name)}”`
      : `(${skip.length}개)`;

  return `같은 파일명(확장자는 소문자로 비교)이 이미 있어 추가하지 않았습니다. ${list}`;
}
