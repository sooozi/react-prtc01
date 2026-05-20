/**
 * Storybook 정적 빌드에서 a11y 패널 스크린샷 캡처 (선택)
 * 사용: yarn build-storybook && node scripts/capture-a11y-screenshots.mjs
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const staticDir = path.join(root, "storybook-static");
const outDir = path.join(root, "docs/images/a11y");

const STORIES = [
  { file: "storybook-button-a11y.png", path: "/?path=/story/components-button--primary" },
  { file: "storybook-confirm-a11y.png", path: "/?path=/story/components-confirm--default" },
  { file: "storybook-pagination-a11y.png", path: "/?path=/story/components-pagination--middle-page" },
];

function contentType(filePath) {
  if (filePath.endsWith(".js")) return "application/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".woff2")) return "font/woff2";
  return "text/html";
}

function startStaticServer(port) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent(req.url?.split("?")[0] ?? "/");
      const safePath = urlPath === "/" ? "/index.html" : urlPath;
      const filePath = path.join(staticDir, safePath);
      try {
        const data = await readFile(filePath);
        res.writeHead(200, { "Content-Type": contentType(filePath) });
        res.end(data);
      } catch {
        const index = await readFile(path.join(staticDir, "index.html"));
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(index);
      }
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  const port = 6010;
  const server = await startStaticServer(port);
  const base = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  for (const story of STORIES) {
    const url = `${base}${story.path}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    try {
      await page.getByRole("button", { name: "Accessibility" }).click({ timeout: 3000 });
    } catch {
      // addon 탭 이름·위치는 Storybook 버전에 따라 다를 수 있음
    }
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(outDir, story.file),
      fullPage: false,
    });
    console.log("saved", story.file);
  }

  await browser.close();
  server.close();
  console.log("Done → docs/images/a11y/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
