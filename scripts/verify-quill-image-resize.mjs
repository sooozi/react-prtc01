/**
 * RichTextEditor 이미지 리사이즈 동작 검증 (Playwright)
 *
 * 사전 조건: `npx vite --port 4173` 실행 중
 * 실행: node scripts/verify-quill-image-resize.mjs
 */
import { chromium } from "playwright";

const BASE_URL = process.env.VERIFY_URL ?? "http://127.0.0.1:4173";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      localStorage.setItem("token", "verify-quill-resize-token");
      localStorage.setItem("userId", "verify-user");
      localStorage.setItem("userName", "verify");
    });

    await page.goto(`${BASE_URL}/post/write`, { waitUntil: "networkidle" });

    const editor = page.locator(".rich-text-editor .ql-editor").first();
    await editor.waitFor({ state: "visible", timeout: 15_000 });

    const dataUrl =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='200'%3E%3Crect width='100%25' height='100%25' fill='%234a90d9'/%3E%3C/svg%3E";

    await editor.evaluate((el, src) => {
      el.innerHTML = `<p><img src="${src}" alt="test" width="320" /></p>`;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, dataUrl);

    const image = editor.locator("img").first();
    await image.waitFor({ state: "visible", timeout: 10_000 });
    await image.click();

    const handle = page.locator(".ql-resize-handle").first();
    await handle.waitFor({ state: "visible", timeout: 5_000 });

    const displaySize = page.locator(".ql-resize-display");
    await displaySize.waitFor({ state: "visible", timeout: 5_000 });

    const box = await handle.boundingBox();
    if (!box) throw new Error("resize handle bounding box missing");

    const widthBefore = await image.evaluate((el) => el.getBoundingClientRect().width);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 40, { steps: 8 });
    await page.mouse.up();

    const widthAfter = await image.evaluate((el) => el.getBoundingClientRect().width);
    if (Math.abs(widthAfter - widthBefore) < 4) {
      throw new Error(`image width did not change (${widthBefore} -> ${widthAfter})`);
    }

    console.log("OK: RichTextEditor image resize verified on /post/write");
    console.log(`    width: ${Math.round(widthBefore)}px -> ${Math.round(widthAfter)}px`);
    console.log(`    display size: ${await displaySize.innerText()}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("FAIL:", error);
  process.exit(1);
});
