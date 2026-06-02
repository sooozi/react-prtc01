import { describe, expect, it } from "vitest";
import { isAllowedAttachmentFile } from "./attachmentAllowlist";

// 파일 생성 함수
function file(name: string, type = ""): File {
  return new File([], name, { type });
}

// 파일 허용 여부 테스트 검증
describe("isAllowedAttachmentFile", () => {
  // 일반 이미지 확장자 허용
  it("allows common image extensions", () => {
    expect(isAllowedAttachmentFile(file("a.png", "image/png"))).toBe(true);
    expect(isAllowedAttachmentFile(file("b.JPG", "image/jpeg"))).toBe(true);
    expect(isAllowedAttachmentFile(file("c.webp", "image/webp"))).toBe(true);
  });

  // 실행·설치 파일과 디스크 이미지 차단
  it("rejects executables and disk images", () => {
    expect(isAllowedAttachmentFile(file("setup.exe", "application/x-msdownload"))).toBe(false);
    expect(isAllowedAttachmentFile(file("app.dmg", "application/x-apple-diskimage"))).toBe(false);
    expect(isAllowedAttachmentFile(file("run.bat", "application/x-bat"))).toBe(false);
  });

  // 이중 확장자 차단
  it("rejects double-extension tricks", () => {
    expect(isAllowedAttachmentFile(file("photo.exe.png", "image/png"))).toBe(false);
  });

  // 화이트리스트 누락 차단
  it("rejects extension whitelist misses even with image MIME", () => {
    expect(isAllowedAttachmentFile(file("doc.pdf", "image/png"))).toBe(false);
    expect(isAllowedAttachmentFile(file("noext", "image/png"))).toBe(false);
  });
});