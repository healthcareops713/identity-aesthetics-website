// Builds public/results.html from an existing page's chrome, so the nav, footer,
// fonts, stylesheets and script tags stay identical to the rest of the site
// rather than being hand-copied and drifting.
//
// The gallery itself is deliberately plain. These are real patients photographed
// on a phone in a treatment room, published with written permission, and the
// honest presentation is the persuasive one: matched pairs, no slider gimmick,
// no retouching claims, and every caption naming only what the photographs
// actually show. Nothing here asserts a timeframe, because the intervals were
// never recorded and inventing one would be an advertising problem, not a
// copywriting choice.
//
// Idempotent: rewrites public/results.html from scratch each run.

import fs from "node:fs";
import path from "node:path";

const out = path.resolve("public");
const DONOR = path.join(out, "accessibility.html");
const donor = fs.readFileSync(DONOR, "utf8");

const head = donor.slice(0, donor.indexOf("<main"));
const tail = donor.slice(donor.indexOf("</main>"));

const pairs = [
  {
    slug: "facial-rejuvenation-1",
    title: "Perioral softening and lip definition",
    treatment: "Injectable treatment",
    w: 350,
    h: 691,
    note:
      "Lines around the mouth are softer and the vermilion border is better defined. The photographs were taken in the treatment room under the same lighting.",
  },
  {
    slug: "facial-rejuvenation-2",
    title: "Midface support and lip volume",
    treatment: "Injectable treatment",
    w: 350,
    h: 700,
    note:
      "Support through the midface and additional lip volume. Hair and makeup differ between the two photographs, which is worth saying plainly rather than letting the pictures imply more than they show.",
  },
  {
    slug: "lip-enhancement-1",
    title: "Lip enhancement, close range",
    treatment: "Dermal filler",
    w: 685,
    h: 339,
    note:
      "Increased volume and a more defined border. Photographed close, without makeup, in the same position both times.",
  },
  {
    slug: "lip-enhancement-2",
    title: "Lip enhancement",
    treatment: "Dermal filler",
    w: 359,
    h: 685,
    note:
      "Fuller lips with a clearer border. Both photographs are from the same visit, so some of what you see is normal immediate post-treatment appearance rather than the settled result.",
  },
];

const figure = (p) => `
<article class="result-case">
  <h3>${p.title}</h3>
  <p class="result-treatment">${p.treatment}</p>
  <div class="result-pair">
    <figure>
      <img src="images/results/${p.slug}-before.webp" alt="${p.title}, before treatment" width="${p.w}" height="${p.h}" loading="lazy" decoding="async">
      <figcaption>Before</figcaption>
    </figure>
    <figure>
      <img src="images/results/${p.slug}-after.webp" alt="${p.title}, after treatment" width="${p.w}" height="${p.h}" loading="lazy" decoding="async">
      <figcaption>After</figcaption>
    </figure>
  </div>
  <p class="result-note">${p.note}</p>
</article>`;

const style = `
<style>
.result-cases{display:grid;gap:34px;margin-top:8px}
@media(min-width:900px){.result-cases{grid-template-columns:repeat(2,minmax(0,1fr));gap:40px 32px}}
.result-case{min-width:0}
.result-case h3{margin:0 0 2px;font-size:1.15rem}
.result-treatment{margin:0 0 14px;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;opacity:.62}
.result-pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.result-pair figure{margin:0;min-width:0}
.result-pair img{width:100%;height:auto;display:block;border-radius:4px;background:rgba(0,0,0,.04)}
.result-pair figcaption{margin-top:7px;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;opacity:.6}
.result-note{margin:13px 0 0;font-size:.93rem;opacity:.8;max-width:60ch}
.results-terms{margin-top:6px}
.results-terms li{margin-bottom:8px}
.results-terms li:last-child{margin-bottom:0}
</style>`;

const schema = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "@id": "https://713botoxme.com/results#webpage",
  url: "https://713botoxme.com/results",
  name: "Patient Results | Identity Aesthetics",
  description:
    "Before and after photographs of actual Identity Aesthetics patients, published with written permission, with plain notes on what each pair does and does not show.",
  isPartOf: { "@id": "https://713botoxme.com/#website" },
  publisher: { "@id": "https://713botoxme.com/#organization" },
  dateModified: "2026-09-17T12:00:00-05:00",
  reviewedBy: { "@id": "https://713botoxme.com/team-dallas-alvey#person" },
};

const main = `<main>
<section class="phero resource-hero"><div class="wrap">
  <p class="crumb"><a href="/">Home</a> / Patient Results</p>
  <span class="eyebrow">Actual patients</span>
  <h1>Results from our own treatment rooms</h1>
  <p class="lead">Every photograph on this page is of an Identity Aesthetics patient, taken at one of our locations and published with that patient's written permission. None of it is stock photography, manufacturer imagery or a generated composite.</p>
</div></section>

<section><div class="wrap">
  <div class="section-head">
    <span class="eyebrow">What you are looking at</span>
    <h2>Four patients, photographed before and after</h2>
    <p>These were taken on a phone in a treatment room rather than in a studio, which is why they look the way they do. We would rather show you what the work actually looks like than something lit to flatter it.</p>
  </div>
  <div class="result-cases">${pairs.map(figure).join("")}</div>
</div></section>

<section class="alt"><div class="wrap">
  <div class="section-head">
    <span class="eyebrow">How to read these</span>
    <h2>What these photographs can and cannot tell you</h2>
  </div>
  <ul class="results-terms">
    <li><strong>Your result will not be this result.</strong> Anatomy, skin quality, age, product, dose and healing all differ. These are individual outcomes, not a typical or expected one.</li>
    <li><strong>We are not claiming a timeframe.</strong> The interval between each pair of photographs was not recorded, so we do not state one. Anywhere you see a med spa promise a specific number of days from a photograph, treat it carefully.</li>
    <li><strong>Lighting, makeup and angle affect what you see.</strong> Where they differ within a pair, the note under that pair says so.</li>
    <li><strong>Photographs cannot establish candidacy.</strong> Whether a treatment suits you is decided at an in-person examination, not from a picture of someone else.</li>
  </ul>
  <p class="disclaimer">Published with written patient permission. Individual results vary. Nothing on this page is a guarantee of outcome, and no treatment can be planned or dosed from a photograph.</p>
</div></section>

<section class="band"><div class="wrap">
  <span class="eyebrow">The next step</span>
  <h2>See what is realistic for your face</h2>
  <p>A consultation is an examination and a conversation, not a sales appointment. You will be told when a treatment is not the right answer for what you want.</p>
  <div class="cta">
    <a class="btn btn-gold" href="book-consultation">Book a Consultation</a>
    <a class="btn btn-line" href="treatments">Browse the Treatment Library</a>
  </div>
</div></section>
</main>`;

let html = head + main + tail;

html = html
  .replace(
    /<title>.*?<\/title>/s,
    "<title>Patient Results | Identity Aesthetics</title>",
  )
  .replace(
    /<meta name="description" content="[^"]*">/,
    '<meta name="description" content="Before and after photographs of actual Identity Aesthetics patients, published with written permission, with plain notes on what each pair shows.">',
  )
  .replace(
    /<link rel="canonical" href="[^"]*">/,
    '<link rel="canonical" href="https://713botoxme.com/results">',
  )
  .replace(
    /<script id="identity-authority-schema" type="application\/ld\+json">.*?<\/script>/s,
    `<script id="identity-authority-schema" type="application/ld+json">${JSON.stringify(schema)}</script>${style}`,
  );

// Open Graph / Twitter tags in the donor still point at the donor page.
html = html
  .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="Patient Results | Identity Aesthetics">')
  .replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="https://713botoxme.com/results">')
  .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="Before and after photographs of actual Identity Aesthetics patients, published with written permission.">')
  .replace(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="Patient Results | Identity Aesthetics">')
  .replace(/<meta name="twitter:description" content="[^"]*">/, '<meta name="twitter:description" content="Before and after photographs of actual Identity Aesthetics patients, published with written permission.">');

fs.writeFileSync(path.join(out, "results.html"), html);
console.log("wrote public/results.html");

// Add to the sitemap if it is not already listed.
const sitemapPath = path.join(out, "sitemap.xml");
let sitemap = fs.readFileSync(sitemapPath, "utf8");
if (sitemap.includes("/results<")) {
  console.log("sitemap already lists /results");
} else {
  const entry = `<url><loc>https://713botoxme.com/results</loc><lastmod>2026-09-17</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
  sitemap = sitemap.replace("</urlset>", `${entry}</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap);
  console.log("added /results to sitemap.xml");
}
