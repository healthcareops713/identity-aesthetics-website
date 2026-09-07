import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("protects the site-controlled consultation form with layered verification", async () => {
  const html = await read("public/book-consultation.html");
  assert.match(html, /data-bot-protected="true"/);
  assert.match(html, /class="bot-trap"/);
  assert.match(html, /id="human-answer"/);
  assert.match(html, /Verify &amp; Prepare My Request/);
});

test("requires server verification before preparing a request", async () => {
  const script = await read("public/conversion-flow.js");
  assert.match(script, /\/api\/human-verification\/challenge/);
  assert.match(script, /\/api\/human-verification\/verify/);
  assert.match(script, /if\(!\(await verifyHuman\(\)\)\)return/);
});

test("enforces signed, expiring, rate-limited same-origin verification", async () => {
  const worker = await read("worker/index.ts");
  assert.match(worker, /BOT_PROTECTION_SECRET/);
  assert.match(worker, /crypto\.subtle\.verify\("HMAC"/);
  assert.match(worker, /tokenAge > 10 \* 60_000/);
  assert.match(worker, /current\.count > 12/);
  assert.match(worker, /new URL\(origin\)\.host !== new URL\(request\.url\)\.host/);
  assert.match(worker, /"cache-control": "no-store, max-age=0"/);
});

test("keeps the Contact page free of an unprotected local form", async () => {
  const html = await read("public/contact.html");
  assert.doesNotMatch(html, /<form\b/i);
  assert.match(html, /href="book-consultation\.html"/);
  assert.match(html, /server-verified human verification/);
});
