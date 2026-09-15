import test from "node:test";
import assert from "node:assert/strict";

// www.713botoxme.com and 713botoxme.com are both attached to the Worker as
// custom domains, so both would otherwise serve the whole site. These tests pin
// the 301 that keeps one canonical hostname, and - just as importantly - pin
// that the bare domain is never redirected, because a mistake there is an
// infinite loop on the live site rather than a cosmetic problem.

const BARE = "https://713botoxme.com";
const WWW = "https://www.713botoxme.com";

async function loadWorker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("canonical-host-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(url.href);
  return worker;
}

const stubEnv = {
  ASSETS: {
    fetch: async () =>
      new Response("<html><body><main>ok</main></body></html>", {
        headers: { "content-type": "text/html" },
      }),
  },
};
const stubCtx = { waitUntil() {}, passThroughOnException() {} };

const get = (worker, origin, path) =>
  worker.fetch(new Request(origin + path, { redirect: "manual" }), stubEnv, stubCtx);

test("www redirects to the bare domain with a permanent 301", async () => {
  const worker = await loadWorker();
  const response = await get(worker, WWW, "/");

  assert.equal(response.status, 301, "a temporary redirect would not consolidate the two hostnames");
  assert.equal(response.headers.get("location"), `${BARE}/`);
});

test("www keeps the path and the query string across the redirect", async () => {
  const worker = await loadWorker();

  const deep = await get(worker, WWW, "/treatment-botox");
  assert.equal(deep.headers.get("location"), `${BARE}/treatment-botox`);

  // Campaign parameters must survive or paid traffic loses its attribution.
  const tracked = await get(worker, WWW, "/book-consultation?utm_source=google&utm_campaign=botox");
  assert.equal(
    tracked.headers.get("location"),
    `${BARE}/book-consultation?utm_source=google&utm_campaign=botox`,
  );
});

test("a www link to a retired path lands in a single hop", async () => {
  const worker = await loadWorker();
  const response = await get(worker, WWW, "/med-spa-services/botox-conroe-tx/");

  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get("location"),
    `${BARE}/botox-conroe-tx`,
    "chaining www -> bare -> new path wastes a hop on exactly the old inbound links that still carry value",
  );
});

test("the bare domain is never redirected", async () => {
  const worker = await loadWorker();

  for (const path of ["/", "/treatments", "/contact"]) {
    const response = await get(worker, BARE, path);
    assert.notEqual(
      response.status,
      301,
      `${path} on the canonical host must be served, not redirected - redirecting it is an infinite loop`,
    );
  }
});

test("the workers.dev preview is left alone", async () => {
  const worker = await loadWorker();
  const preview = "https://identity-aesthetics-website.operations-ca5.workers.dev";
  const response = await worker.fetch(
    new Request(`${preview}/`, { redirect: "manual" }),
    stubEnv,
    stubCtx,
  );

  assert.notEqual(response.status, 301, "the preview must stay usable on its own hostname");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
});
