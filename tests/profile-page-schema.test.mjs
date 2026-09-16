import { readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

// Google's ProfilePage rich result has exactly one required property,
// mainEntity, and it must point at a Person or Organization that actually
// exists in the page's structured data. On 2026-09-16 Search Console reported
// both failure modes on this site at once: two team pages had no mainEntity at
// all, and all three used a bare date for dateModified, which schema.org reads
// as a Date rather than the DateTime the spec asks for. Neither is visible on
// the page, so nothing but a test will catch a regression - the JSON-LD is
// generated, and a template change can drop a property without anyone noticing
// until Google emails weeks later.

const BLOCK = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

const hasType = (node, type) =>
  node?.["@type"] === type ||
  (Array.isArray(node?.["@type"]) && node["@type"].includes(type));

async function profilePages() {
  const pages = [];
  for await (const path of glob("public/*.html")) {
    const html = await readFile(path, "utf8");
    if (!html.includes("ProfilePage")) continue;

    const ids = new Set();
    let profile = null;

    for (const [, body] of html.matchAll(BLOCK)) {
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch (error) {
        assert.fail(`${path} has JSON-LD that does not parse: ${error.message}`);
      }
      const nodes = Array.isArray(parsed) ? parsed : (parsed["@graph"] ?? [parsed]);
      for (const node of nodes) {
        if (node?.["@id"]) ids.add(node["@id"]);
        if (hasType(node, "ProfilePage")) profile = node;
      }
    }

    pages.push({ path, profile, ids });
  }
  return pages;
}

test("every ProfilePage names the person the page is about", async () => {
  const pages = await profilePages();
  assert.ok(pages.length > 0, "the team pages carry ProfilePage markup - finding none means the search broke");

  for (const { path, profile } of pages) {
    assert.ok(profile, `${path} mentions ProfilePage but has no ProfilePage node`);
    assert.ok(
      profile.mainEntity?.["@id"],
      `${path}: mainEntity is the one required property, and without it Google drops the profile rich result entirely`,
    );
  }
});

test("the mainEntity reference resolves to a Person on the same page", async () => {
  for (const { path, profile, ids } of await profilePages()) {
    const target = profile.mainEntity["@id"];
    assert.ok(
      ids.has(target),
      `${path}: mainEntity points at ${target}, which no node on the page defines - a dangling @id validates as JSON but describes nothing`,
    );
  }
});

test("ProfilePage dates are DateTimes, not bare dates", async () => {
  for (const { path, profile } of await profilePages()) {
    for (const field of ["dateModified", "dateCreated"]) {
      const value = profile[field];
      if (value === undefined) continue;
      assert.match(
        value,
        ISO_DATETIME,
        `${path}: ${field} is "${value}" - schema.org reads a bare date as a Date, and Google reports it as an invalid datetime`,
      );
    }
  }
});
