// 허용 확장자
export const ALLOWED_ATTACHMENT_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "bmp",
  "ico",
  "svg",
] as const;

export type AllowedAttachmentExtension = (typeof ALLOWED_ATTACHMENT_EXTENSIONS)[number];

const ALLOWED_EXTENSION_SET = new Set<string>(ALLOWED_ATTACHMENT_EXTENSIONS);

// 파일 선택창: image/* 대신 jpg, png처럼 허용 확장자만 accept에 넣음
export const ATTACHMENT_FILE_INPUT_ACCEPT = ALLOWED_ATTACHMENT_EXTENSIONS.map((ext) => `.${ext}`).join(
  ",",
);

// 허용 확장자에 해당하는 MIME 타입
const ALLOWED_MIME_SET = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/bmp",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

// 파일명 중간에 숨겨진 실행·설치 파일 확장자
const DANGEROUS_EXTENSIONS_IN_NAME = new Set<string>([
  "exe",
  "dmg",
  "app",
  "msi",
  "bat",
  "cmd",
  "com",
  "scr",
  "dll",
  "sh",
  "bash",
  "ps1",
  "vbs",
  "js",
  "jar",
  "apk",
  "deb",
  "rpm",
  "pkg",
  "iso",
]);

// 차단된 MIME 타입 집합
const BLOCKED_MIME_EXACT = new Set<string>([
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-dosexec",
  "application/x-executable",
  "application/x-apple-diskimage",
  "application/vnd.apple.installer+xml",
  "application/java-archive",
  "application/x-sh",
  "application/x-bat",
  "text/javascript",
  "application/javascript",
  "text/html",
]);

export const ALLOWED_ATTACHMENT_EXTENSIONS_LABEL = ALLOWED_ATTACHMENT_EXTENSIONS.map((e) =>
  e.toUpperCase(),
).join(", ");

export const ATTACHMENT_ALLOWLIST_FORM_ERROR = `허용되지 않는 파일 형식이 포함되어 있습니다. (${ALLOWED_ATTACHMENT_EXTENSIONS_LABEL}만 첨부할 수 있습니다.)`;

// 마지막 `.` 뒤 확장자 (소문자). 없거나 비정상이면 `null`
export function getNormalizedFileExtension(fileName: string): string | null {
  const trimmed = fileName.trim();
  const lastDot = trimmed.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === trimmed.length - 1) return null;
  const ext = trimmed.slice(lastDot + 1).toLowerCase();
  if (!/^[a-z0-9]+$/.test(ext)) return null;
  return ext;
}

// 파일명 중간에 숨겨진 실행·설치 파일 확장자 검사
function hasDangerousExtensionSegment(fileName: string): boolean {
  const lower = fileName.trim().toLowerCase(); // 파일명 소문자로 변환
  const parts = lower.split("."); // 파일명을 . 기준으로 분리
  if (parts.length < 2) return false; // 파일명에 .이 없거나 하나 => 실행·설치 파일 확장자 검사 필요 없음
  for (let i = 1; i < parts.length; i++) { // 파일명 중간에 있는 확장자 검사
    if (DANGEROUS_EXTENSIONS_IN_NAME.has(parts[i]!)) return true;
  }
  return false;
}

// 차단된 MIME 타입 검사
function isBlockedMimeType(mime: string): boolean {
  const normalized = mime.trim().toLowerCase();
  if (!normalized) return false;
  if (BLOCKED_MIME_EXACT.has(normalized)) return true;
  if (normalized.startsWith("image/")) return false;
  if (ALLOWED_MIME_SET.has(normalized)) return false;
  if (normalized === "application/octet-stream") return false;
  return true;
}

// 확장자 화이트리스트 + MIME·이중 확장자 검사 (파일 업로드 시 허용 여부 검사)
export function isAllowedAttachmentFile(file: File): boolean {
  if (hasDangerousExtensionSegment(file.name)) return false; // 파일명 중간에 숨겨진 실행·설치 파일 확장자 검사

  const ext = getNormalizedFileExtension(file.name); // 마지막 `.` 뒤 확장자 (소문자). 없거나 비정상 => `null`
  if (!ext || !ALLOWED_EXTENSION_SET.has(ext)) return false; // 허용 확장자 검사

  const mime = file.type.trim().toLowerCase(); // MIME 타입 소문자로 변환
  if (isBlockedMimeType(mime)) return false; // 차단된 MIME 타입 검사
  if (!mime || mime === "application/octet-stream") return true; // MIME 타입이 없거나 application/octet-stream이면 허용
  if (mime.startsWith("image/")) return true; // MIME 타입이 image/로 시작하면 허용
  return ALLOWED_MIME_SET.has(mime); // 허용 확장자에 해당하는 MIME 타입 검사
}

export function partitionFilesByAttachmentAllowlist(files: File[]): {
  allowed: File[];
  rejected: File[];
} {
  const allowed: File[] = [];
  const rejected: File[] = [];
  for (const file of files) {
    if (isAllowedAttachmentFile(file)) allowed.push(file);
    else rejected.push(file);
  }
  return { allowed, rejected };
}

export function partitionFileListByAttachmentAllowlist(fileList: FileList | null): {
  allowed: File[];
  rejected: File[];
} {
  if (!fileList || fileList.length === 0) return { allowed: [], rejected: [] };
  return partitionFilesByAttachmentAllowlist(Array.from(fileList));
}
