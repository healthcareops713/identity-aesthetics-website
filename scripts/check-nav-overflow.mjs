// Serves dist/client and checks every page for horizontal overflow at a range of
// viewport widths, reporting how far the "Book Now" button sits from the right
// edge.
//
// Why this exists: on 2026-09-17, 86 of 95 pages overflowed by 8-18px at 1440px
// - the most common laptop width - putting a horizontal scrollbar on nearly the
// whole site and clipping the primary booking CTA. The cause was that the
// desktop mega nav switches on at exactly 1440px, which is also the width at
// which brand + links + actions stop fitting inside the wrap's content box.
//
// It is NOT part of `npm test`. The test suite is plain node:test and runs in
// under two seconds; this needs a real browser, walks 95 pages per width, and
// takes minutes. Run it by hand after touching anything in the header, the
// wrap, or the nav breakpoints:
//
//   npm run build && node scripts/check-nav-overflow.mjs
//
// Exits non-zero if any page overflows, so it can be wired into CI later if the
// browser dependency becomes acceptable there.

import http from "node:http";
import path from "node:path";
import { readFile, stat, readdir } from "node:fs/promises";
import { createRequire } from "node:module";

const ROOT = path.resolve("dist/client");
const WIDTHS = [1440, 1366, 1280, 1024, 768, 390];
const MIN_SLACK = 8; // px the Book Now button should keep clear of the edge

const TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".xml": "application/xml",
  ".json": "application/json", ".woff2": "font/woff2",
};

function loadChromium() {
  const require = createRequire(import.meta.url);
  for (const id of ["playwright", "playwright-core"]) {
    try { return require(id).chromium; } catch {}
  }
  try {
    return require("/home/claude/.npm-global/lib/node_modules/playwright/index.js").chromium;
  } catch {}
  console.error("playwright is not installed. `npm i -D playwright` or install it globally.");
  process.exit(69);
}

const server = http.createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  let file = path.join(ROOT, p);
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
  } catch {
    if (!path.extname(file)) file += ".html";
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const files = (await readdir(ROOT))
  .filter((f) => f.endsWith(".html"))
  .filter((f) => !/^google[0-9a-f]+\.html$/.test(f))   // the Search Console token
  .filter((f) => f !== "animated-logo-preview.html");  // internal, not in the sitemap

const chromium = loadChromium();
const browser = await chromium.launch();
let failures = 0;

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  // Block every third-party request. Fonts, the translate widget and the
  // LegitScript badge are irrelevant here and turn a 30-second run into a
  // timeout when the sandbox refuses the connections one at a time.
  await ctx.route("**://*/**", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
  );
  const page = await ctx.newPage();
  const bad = [];

  for (const file of files) {
    await page.goto(`${base}/${file}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(200);
    const result = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const btn = document.querySelector(".nav .btn-gold");
      const rect = btn ? btn.getBoundingClientRect() : null;
      return {
        overflow: document.documentElement.scrollWidth - vw,
        slack: rect ? Math.round(vw - rect.right) : null,
      };
    });
    if (result.overflow > 1) bad.push(`${file} overflows by ${result.overflow}px`);
    else if (result.slack !== null && result.slack < MIN_SLACK)
      bad.push(`${file} Book Now only ${result.slack}px from the edge`);
  }

  failures += bad.length;
  console.log(`${String(width).padEnd(5)} ${bad.length ? `FAIL ${bad.length}/${files.length}` : `ok   0/${files.length}`}`);
  for (const b of bad.slice(0, 8)) console.log(`        ${b}`);
  if (bad.length > 8) console.log(`        …and ${bad.length - 8} more`);
  await ctx.close();
}

await browser.close();
server.close();

console.log(failures ? `\n${failures} problem(s) found` : "\nno horizontal overflow at any tested width");
process.exit(failures ? 1 : 0);
