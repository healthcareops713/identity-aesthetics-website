import assert from "node:assert/strict";
import test from "node:test";

// The Worker keeps answering on its *.workers.dev hostname after a custom
// domain is attached. That preview copy must stay fully usable for review but
// must never be indexed, and the production hostname must be untouched.
const loadWorker = async (tag) => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("preview-noindex", `${process.pid}-${Date.now()}-${tag}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
};

const PREVIEW = "https://identity-aesthetics-website.operations-ca5.workers.dev";
const PRODUCTION = "https://713botoxme.com";

const env = () => ({
  ASSETS: { fetch: async () => new Response("<html><body>hi</body></html>", { headers: { "content-type": "text/html" } }) },
  BOT_PROTECTION_SECRET: "test-bot-secret",
  GOOGLE_MAIL_WEBHOOK_URL: "https://script.google.com/macros/s/TEST/exec",
  GOOGLE_MAIL_WEBHOOK_SECRET: "test-hook-secret",
});
const ctx = () => ({ waitUntil() {}, passThroughOnException() {} });

test("the preview hostname tells search engines not to index it", async () => {
  const worker = await loadWorker("preview");
  const response = await worker.fetch(new Request(`${PREVIEW}/`), env(), ctx());
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
});

test("the production hostname is never marked noindex", async () => {
  const worker = await loadWorker("production");
  const response = await worker.fetch(new Request(`${PRODUCTION}/`), env(), ctx());
  assert.equal(
    response.headers.get("x-robots-tag"),
    null,
    "713botoxme.com must remain indexable or the launch loses its search presence",
  );
});

test("the preview serves a robots.txt that disallows crawling", async () => {
  const worker = await loadWorker("robots-preview");
  const response = await worker.fetch(new Request(`${PREVIEW}/robots.txt`), env(), ctx());
  const body = await response.text();
  assert.match(body, /Disallow: \//);
  assert.doesNotMatch(body, /Sitemap:/, "the preview must not advertise the production sitemap");
});

test("production robots.txt is left alone", async () => {
  const worker = await loadWorker("robots-production");
  const assets = new Response("User-agent: *\nAllow: /\n\nSitemap: https://713botoxme.com/sitemap.xml", {
    headers: { "content-type": "text/plain" },
  });
  const response = await worker.fetch(
    new Request(`${PRODUCTION}/robots.txt`),
    { ...env(), ASSETS: { fetch: async () => assets } },
    ctx(),
  );
  const body = await response.text();
  assert.match(body, /Allow: \//);
  assert.match(body, /Sitemap:/);
});

test("the preview stays fully functional - verification still issues challenges", async () => {
  const worker = await loadWorker("challenge");
  const response = await worker.fetch(new Request(`${PREVIEW}/api/human-verification/challenge`), env(), ctx());
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true, "a reviewer must still be able to submit the consultation form");
  assert.ok(body.token, "the challenge must still carry a signed token");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
});

test("legacy redirects still work on both hostnames and keep their status", async () => {
  const worker = await loadWorker("redirects");
  for (const origin of [PREVIEW, PRODUCTION]) {
    const response = await worker.fetch(new Request(`${origin}/med-spa-services/massage/`), env(), ctx(), {
      redirect: "manual",
    });
    assert.equal(response.status, 301, `${origin} should still 301 legacy URLs`);
    assert.ok(response.headers.get("location"), `${origin} redirect must keep its Location header`);
  }
});
