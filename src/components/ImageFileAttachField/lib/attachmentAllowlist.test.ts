import { describe, expect, it } from "vitest";
import { isAllowedAttachmentFile } from "./attachmentAllowlist";

// 파일 생성 함수
function file(name: string, type = ""): File {
  return new File([], name, { type });
}

// 파일 허용 여부 테스트
describe("isAllowedAttachmentFile", () => {
  it("allows common image extensions", () => {
    expect(isAllowedAttachmentFile(file("a.png", "image/png"))).toBe(true);
    expect(isAllowedAttachmentFile(file("b.JPG", "image/jpeg"))).toBe(true);
    expect(isAllowedAttachmentFile(file("c.webp", "image/webp"))).toBe(true);
  });

  it("rejects executables and disk images", () => {
    expect(isAllowedAttachmentFile(file("setup.exe", "application/x-msdownload"))).toBe(false);
    expect(isAllowedAttachmentFile(file("app.dmg", "application/x-apple-diskimage"))).toBe(false);
    expect(isAllowedAttachmentFile(file("run.bat", "application/x-bat"))).toBe(false);
  });

  it("rejects double-extension tricks", () => {
    expect(isAllowedAttachmentFile(file("photo.exe.png", "image/png"))).toBe(false);
  });

  it("rejects extension whitelist misses even with image MIME", () => {
    expect(isAllowedAttachmentFile(file("doc.pdf", "image/png"))).toBe(false);
    expect(isAllowedAttachmentFile(file("noext", "image/png"))).toBe(false);
  });
});
