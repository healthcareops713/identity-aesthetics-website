import { readFile, access } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

// Google Search Console verifies ownership by fetching this exact file and
// matching its exact contents. Google asks for it to stay in place permanently:
// if it disappears, verification is revoked and the property silently stops
// reporting. It is a 53-byte file with no visible purpose, which is precisely
// the kind of thing that gets "cleaned up" during a future tidy-up, so these
// tests make its removal or alteration a build failure rather than a surprise
// in Search Console weeks later.

const FILENAME = "google94cd8cd3b311c6ce.html";
const EXPECTED = "google-site-verification: google94cd8cd3b311c6ce.html";

test("the Search Console verification file is present in the source", async () => {
  const path = new URL(`../public/${FILENAME}`, import.meta.url);
  await access(path);
  const contents = await readFile(path, "utf8");

  assert.equal(
    contents.trim(),
    EXPECTED,
    "Google matches the contents exactly - any edit breaks verification",
  );
});

test("the verification file survives the build into the deployed assets", async () => {
  const path = new URL(`../dist/client/${FILENAME}`, import.meta.url);
  await access(path);
  const contents = await readFile(path, "utf8");

  assert.equal(
    contents.trim(),
    EXPECTED,
    "the file must reach dist/client untouched, or Google fetches something it does not recognise",
  );
});

test("the verification file is kept out of the sitemap", async () => {
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

  assert.ok(
    !sitemap.includes(FILENAME),
    "a verification token is not a page; listing it invites Google to index a bare string as content",
  );
});
