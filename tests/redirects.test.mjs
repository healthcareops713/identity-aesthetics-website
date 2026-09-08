import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const ORIGIN = "https://713botoxme.com";

async function loadWorker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("redirects-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(url.href);
  return worker;
}

const stubEnv = {
  ASSETS: { fetch: async () => new Response("<html><body><main>ok</main></body></html>", { headers: { "content-type": "text/html" } }) },
};
const stubCtx = { waitUntil() {}, passThroughOnException() {} };

async function get(worker, path) {
  return worker.fetch(new Request(ORIGIN + path, { redirect: "manual" }), stubEnv, stubCtx);
}

test("every legacy URL in the old sitemap returns a 301 to an existing page", async () => {
  const worker = await loadWorker();
  const src = await readFile(new URL("../worker/redirects.ts", import.meta.url), "utf8");
  const entries = [...src.matchAll(/^ {2}"([^"]+)": "([^"]+)",/gm)].map(([, from, to]) => ({ from, to }));
  assert.ok(entries.length >= 50, `expected the full legacy map, found ${entries.length}`);

  for (const { from, to } of entries) {
    const res = await get(worker, from);
    assert.equal(res.status, 301, `${from} should 301`);
    assert.equal(new URL(res.headers.get("location")).pathname, to, `${from} should point at ${to}`);
  }
});

test("redirects match with or without a trailing slash, and preserve query strings", async () => {
  const worker = await loadWorker();

  const noSlash = await get(worker, "/meet-the-team");
  assert.equal(noSlash.status, 301);
  assert.equal(new URL(noSlash.headers.get("location")).pathname, "/team.html");

  const tagged = await get(worker, "/locations/botox-in-katy-tx/?utm_source=google&utm_medium=cpc");
  assert.equal(tagged.status, 301);
  const dest = new URL(tagged.headers.get("location"));
  assert.equal(dest.pathname, "/botox-katy-tx.html");
  assert.equal(dest.searchParams.get("utm_source"), "google");
  assert.equal(dest.searchParams.get("utm_medium"), "cpc");
});

test("city-qualified legacy URLs land on the matching city page", async () => {
  const worker = await loadWorker();
  const cases = [
    ["/med-spa-services/botox-conroe-tx/", "/botox-conroe-tx.html"],
    ["/locations/botox-in-houston-tx/", "/botox-houston-tx.html"],
    ["/locations/botox-in-fulshear-tx/", "/botox-fulshear-tx.html"],
    ["/locations/botox-in-katy-tx/", "/botox-katy-tx.html"],
  ];
  for (const [from, to] of cases) {
    const res = await get(worker, from);
    assert.equal(new URL(res.headers.get("location")).pathname, to, `${from} should keep its city`);
  }
});

test("current pages and API routes are not redirected", async () => {
  const worker = await loadWorker();
  for (const path of ["/", "/index.html", "/treatments.html", "/botox-conroe-tx.html", "/locations.html"]) {
    const res = await get(worker, path);
    assert.notEqual(res.status, 301, `${path} must not redirect`);
  }
  const api = await worker.fetch(new Request(`${ORIGIN}/api/consultation`, { method: "GET" }), stubEnv, stubCtx);
  assert.equal(api.status, 405, "the consultation endpoint should still answer, not redirect");
});
