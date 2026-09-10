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

// The unit tests above call the Worker directly, which hides the fact that
// Cloudflare serves matching static assets *before* the Worker runs. robots.txt
// is a static file, so the Worker never sees that request on the real hostname
// and cannot vary it - which is why the preview still serves the production
// robots.txt and only the x-robots-tag header applies to Worker-handled routes.
//
// run_worker_first would route robots.txt to the Worker, but this Worker is
// deployed without an ASSETS binding (confirmed in the deploy log's binding
// list), so it would have no way to serve the real file and production
// robots.txt would break. Do not add it back without adding that binding and
// proving the production hostname still returns the real robots.txt.
test("the deploy manifest keeps assets simple and does not reroute robots.txt", async () => {
  const { readFile } = await import("node:fs/promises");
  const config = JSON.parse(
    await readFile(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"),
  );
  assert.ok(config.assets, "the build must still declare an assets block");
  assert.equal(config.assets.directory, "../client", "the asset directory must survive");
  assert.equal(
    config.assets.run_worker_first,
    undefined,
    "routing robots.txt to the Worker needs an ASSETS binding first, or production robots.txt breaks",
  );
});
