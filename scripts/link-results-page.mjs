// public/results.html was added to the sitemap but linked from nowhere. Every
// other significant page on the site has 88 to 95 inbound internal links;
// /results had zero. Google would still crawl it from the sitemap, but an
// orphaned page collects no internal link equity and no human being ever
// arrives at it, which for the one page carrying real patient photographs is
// the worst possible outcome.
//
// The footers on this site come in sixteen shapes - the first column is called
// Treatments, Resources, Explore, Peptide Education, Wellness and several other
// things depending on the page - so rather than matching a column by name, this
// inserts the link directly after the first <h4> inside <footer>, whatever that
// heading happens to say. That is the "what we offer" column on every variant.
//
// Anchored, idempotent, size-checked: a replacement that would remove more than
// it matched is skipped rather than applied.

import fs from "node:fs";
import path from "node:path";

const out = path.resolve("public");
const LINK = '<a href="results">Patient Results</a>';

// Pages that are not part of the public site.
const SKIP = new Set(["google94cd8cd3b311c6ce.html", "animated-logo-preview.html", "results.html"]);

const files = fs.readdirSync(out).filter((f) => f.endsWith(".html") && !SKIP.has(f));

let changed = 0;
let already = 0;
let noFooter = 0;

for (const file of files) {
  const full = path.join(out, file);
  const original = fs.readFileSync(full, "utf8");

  const footerStart = original.indexOf("<footer");
  const footerEnd = original.indexOf("</footer>", footerStart);
  if (footerStart === -1 || footerEnd === -1) { noFooter++; continue; }

  const footer = original.slice(footerStart, footerEnd);
  if (footer.includes('href="results"')) { already++; continue; }

  const h4 = footer.match(/<h4>[^<]*<\/h4>/);
  if (!h4) { noFooter++; continue; }

  const at = footerStart + footer.indexOf(h4[0]) + h4[0].length;
  const next = original.slice(0, at) + LINK + original.slice(at);

  if (next.length !== original.length + LINK.length) {
    console.log(`skip ${file}: unexpected size change`);
    continue;
  }

  fs.writeFileSync(full, next);
  changed++;
}

console.log(`linked:        ${changed}`);
console.log(`already had:   ${already}`);
console.log(`no footer/h4:  ${noFooter}`);
