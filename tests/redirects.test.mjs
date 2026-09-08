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
  const gone = [...src.matchAll(/^ {2}"(\/[^"]+)",/gm)].map(([, u]) => u);

  // Every URL in the old site's sitemap must be accounted for: either it moves
  // somewhere real, or it is explicitly gone. 51 was the count at migration.
  assert.equal(entries.length + gone.length, 51,
    `expected all 51 legacy URLs to be handled, found ${entries.length} redirects + ${gone.length} gone`);

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
  assert.equal(new URL(noSlash.headers.get("location")).pathname, "/team");

  const tagged = await get(worker, "/locations/botox-in-katy-tx/?utm_source=google&utm_medium=cpc");
  assert.equal(tagged.status, 301);
  const dest = new URL(tagged.headers.get("location"));
  assert.equal(dest.pathname, "/botox-katy-tx");
  assert.equal(dest.searchParams.get("utm_source"), "google");
  assert.equal(dest.searchParams.get("utm_medium"), "cpc");
});

test("city-qualified legacy URLs land on the matching city page", async () => {
  const worker = await loadWorker();
  const cases = [
    ["/med-spa-services/botox-conroe-tx/", "/botox-conroe-tx"],
    ["/locations/botox-in-houston-tx/", "/botox-houston-tx"],
    ["/locations/botox-in-fulshear-tx/", "/botox-fulshear-tx"],
    ["/locations/botox-in-katy-tx/", "/botox-katy-tx"],
  ];
  for (const [from, to] of cases) {
    const res = await get(worker, from);
    assert.equal(new URL(res.headers.get("location")).pathname, to, `${from} should keep its city`);
  }
});

test("current pages and API routes are not redirected", async () => {
  const worker = await loadWorker();
  for (const path of ["/", "/", "/treatments", "/botox-conroe-tx", "/locations"]) {
    const res = await get(worker, path);
    assert.notEqual(res.status, 301, `${path} must not redirect`);
  }
  const api = await worker.fetch(new Request(`${ORIGIN}/api/consultation`, { method: "GET" }), stubEnv, stubCtx);
  assert.equal(api.status, 405, "the consultation endpoint should still answer, not redirect");
});

test("junk URLs return 410 Gone, not a redirect", async () => {
  const worker = await loadWorker();
  const src = await readFile(new URL("../worker/redirects.ts", import.meta.url), "utf8");

  const gone = [...src.matchAll(/^ {2}"(\/[^"]+)",/gm)].map(([, u]) => u);
  assert.ok(gone.length >= 5, `expected the gone list, found ${gone.length}`);

  for (const path of gone) {
    for (const variant of [path, path.replace(/\/$/, "")]) {
      const res = await get(worker, variant);
      assert.equal(res.status, 410, `${variant} should be 410 Gone`);
      assert.equal(res.headers.get("x-robots-tag"), "noindex");
      assert.equal(res.headers.get("location"), null, "410 must not redirect");
    }
  }

  // nothing may be in both lists - a URL cannot be gone and moved at once
  const redirects = [...src.matchAll(/^ {2}"([^"]+)": "([^"]+)",/gm)].map(([, from]) => from);
  const overlap = redirects.filter((r) => gone.includes(r));
  assert.deepEqual(overlap, [], "a URL must not appear in both the gone list and the redirect map");
});
