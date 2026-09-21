// The four neurotoxin pages were emitted from one template with only the brand
// name, price, onset and duration varying, which left them 91-94% identical to
// each other by 8-word shingle. That is the exact shape Google's scaled-content
// guidance is aimed at, and these are the highest-value commercial pages on the
// site. This script replaces the shared boilerplate with what actually differs
// between the four products, taken from their FDA labels rather than from
// marketing copy.
//
// It edits public/treatment-{botox,dysport,xeomin,jeuveau}.html in place and is
// safe to re-run: every replacement is anchored on the text it replaces, and the
// comparison section is skipped if already present.
//
// It deliberately does NOT touch the visible FAQ, because those questions are
// mirrored in FAQPage JSON-LD in the head - changing one without the other
// creates a structured-data mismatch. That is a separate, paired change.

import fs from "node:fs";
import path from "node:path";

const out = path.resolve("public");

const products = {
  botox: {
    name: "Botox® Cosmetic",
    summary:
      "Botox® Cosmetic is onabotulinumtoxinA, a prescription botulinum toxin type A. Of the four toxins we carry it has the widest FDA-approved cosmetic map: its label covers moderate-to-severe glabellar lines, lateral canthal lines (crow&rsquo;s feet), forehead lines and platysma bands. It is supplied as the neurotoxin together with its naturally associated complexing proteins, and it has the longest cosmetic track record of the group. Identity Aesthetics selects dose and placement from your anatomy, movement and the degree of softness you want.",
    concerns: [
      "Frown lines between the brows &mdash; on the FDA label",
      "Crow&rsquo;s feet at the outer eye &mdash; on the FDA label",
      "Horizontal forehead lines &mdash; on the FDA label",
      "Vertical platysma bands in the neck &mdash; on the FDA label",
    ],
    compare: {
      heading: "How Botox® Cosmetic differs from Dysport, Xeomin and Jeuveau",
      lead: "All four are botulinum toxin type A and all four soften the same kind of movement line. What separates them is what each label actually covers, how each is formulated, and how each is dosed.",
      points: [
        [
          "It covers the most areas on label",
          "Botox® Cosmetic is the only one of the four whose cosmetic labeling extends past the upper face to platysma bands in the neck. Dysport and Jeuveau are labeled for glabellar lines alone; Xeomin covers glabellar, forehead and lateral canthal lines. When a plan spans several areas, this is the product whose label already reaches them.",
        ],
        [
          "It carries complexing proteins",
          "Botox® Cosmetic is supplied as the neurotoxin with the accessory proteins that occur alongside it. Xeomin is the outlier here &mdash; its label describes separating the active neurotoxin from those hemagglutinin and non-hemagglutinin proteins.",
        ],
        [
          "It has non-cosmetic uses on the same molecule",
          "The onabotulinumtoxinA label also covers a range of medical conditions. That matters mostly because it means decades of dosing and safety data across a very large treated population.",
        ],
      ],
    },
  },

  dysport: {
    name: "Dysport®",
    summary:
      "Dysport® is abobotulinumtoxinA. Its cosmetic labeling is narrower than Botox® Cosmetic&rsquo;s &mdash; the FDA indication is the temporary improvement in the appearance of moderate-to-severe glabellar lines in adults <em>under 65 years of age</em>. The most practical thing to understand about Dysport® is its unit scale: a Dysport® unit is not a Botox® unit, and the two cannot be converted by arithmetic. A larger number of units does not mean a larger dose.",
    concerns: [
      "Frown lines between the brows &mdash; the labeled cosmetic use",
      "Adults under 65, which is how the cosmetic indication is written",
      "Patients already familiar with toxin treatment who want to compare products",
      "Planning where the provider judges Dysport&rsquo;s dosing suits the muscle",
    ],
    compare: {
      heading: "How Dysport® differs from Botox®, Xeomin and Jeuveau",
      lead: "Dysport® is the product most often misunderstood on price, because its units are counted on a different scale from the others.",
      points: [
        [
          "Its units are not comparable to any other toxin",
          "Every botulinum toxin label carries the same warning in its own words: units of one product cannot be compared to or converted into units of another. Dysport® is where this bites hardest in practice, because a Dysport® treatment plan involves a visibly larger unit count than the equivalent Botox® plan. Per-unit price across two different toxins is not a like-for-like comparison, and a provider plans a fresh dose rather than running a conversion.",
        ],
        [
          "Its cosmetic label names an age range",
          "Dysport® is the only one of the four whose cosmetic indication is written for adults under 65. Botox® Cosmetic, Xeomin and Jeuveau are labeled for adults without that ceiling.",
        ],
        [
          "Its cosmetic label covers the glabella only",
          "For the frown lines between the brows, Dysport® is squarely on label. Treatment of other areas is a clinical decision made with you at the time, not something the cosmetic indication covers.",
        ],
      ],
    },
  },

  xeomin: {
    name: "Xeomin®",
    summary:
      "Xeomin® is incobotulinumtoxinA, and it is the purified member of this group. Its manufacturing separates the active neurotoxin from the hemagglutinin and non-hemagglutinin proteins that accompany it in the other three products &mdash; which is why it is often described as the &ldquo;naked&rdquo; toxin. Its FDA cosmetic labeling covers moderate-to-severe upper facial lines: glabellar lines, forehead lines and lateral canthal lines in adults.",
    concerns: [
      "Frown lines between the brows &mdash; on the FDA label",
      "Horizontal forehead lines &mdash; on the FDA label",
      "Crow&rsquo;s feet at the outer eye &mdash; on the FDA label",
      "Patients who prefer a formulation without complexing proteins",
    ],
    compare: {
      heading: "How Xeomin® differs from Botox®, Dysport and Jeuveau",
      lead: "Xeomin&rsquo;s difference is in the vial rather than in the injection. It is the only one of the four supplied without the accessory proteins.",
      points: [
        [
          "It is the only one without complexing proteins",
          "The Xeomin® label describes separating the active ingredient from the hemagglutinin and non-hemagglutinin proteins through a series of purification steps. Botox® Cosmetic, Dysport® and Jeuveau® all include those accessory proteins. This is a genuine formulation difference, not a marketing distinction.",
        ],
        [
          "Its cosmetic label covers the whole upper face",
          "Glabellar, forehead and lateral canthal lines all sit within Xeomin&rsquo;s labeled cosmetic use in adults &mdash; broader than Dysport® or Jeuveau®, which are labeled for the glabella alone.",
        ],
        [
          "Its units are still its own",
          "Purified or not, the same rule applies: Xeomin® units cannot be compared to or converted into units of any other botulinum toxin product. Switching to Xeomin® means a new dose plan, not a translated one.",
        ],
      ],
    },
  },

  jeuveau: {
    name: "Jeuveau®",
    summary:
      "Jeuveau® is prabotulinumtoxinA-xvfs, and it is the only one of the four that exists purely for aesthetics. Its FDA indication is the temporary improvement in the appearance of moderate-to-severe glabellar lines associated with corrugator and/or procerus muscle activity in adults &mdash; and its boxed warning states plainly that it is not approved for spasticity or any condition other than glabellar lines. Where the other three carry long lists of medical indications, Jeuveau® was developed and approved for this one cosmetic use.",
    concerns: [
      "Frown lines between the brows &mdash; the single labeled use",
      "Adults seeking treatment of the glabellar complex specifically",
      "Patients comparing toxin options for the frown-line area",
      "Anyone who wants the product choice kept narrow and on label",
    ],
    compare: {
      heading: "How Jeuveau® differs from Botox®, Dysport and Xeomin",
      lead: "Jeuveau® is the narrowest product of the four, and that narrowness is the point rather than a limitation.",
      points: [
        [
          "It is cosmetic-only by design",
          "Botox® Cosmetic, Dysport® and Xeomin® all share a molecule with therapeutic products carrying indications for conditions like spasticity, cervical dystonia and chronic sialorrhea. Jeuveau® does not. Its label is one cosmetic indication, and its boxed warning says so explicitly.",
        ],
        [
          "Its label covers the glabella alone",
          "The indication names the corrugator and procerus muscles &mdash; the frown-line complex between the brows. Xeomin® and Botox® Cosmetic carry broader cosmetic labeling across the upper face.",
        ],
        [
          "Its units are its own, like every other toxin",
          "A Jeuveau® unit is not a Botox®, Dysport® or Xeomin® unit. If you are moving to Jeuveau® from another product, the provider builds a new dose from your anatomy and prior response rather than converting a number.",
        ],
      ],
    },
  },
};

const SHARED_SUMMARY =
  /<p>[^<]*is a prescription botulinum toxin type A treatment used to temporarily reduce muscle activity that contributes to expression lines\..*?<\/p>/s;
const SHARED_CONCERNS =
  /<h3>Concerns it may address<\/h3><ul>.*?<\/ul>/s;

const compareSection = ({ heading, lead, points }) => {
  const cards = points
    .map(([h, body]) => `<article class="card"><h3>${h}</h3><p>${body}</p></article>`)
    .join("");
  return (
    `\n<section class="alt" id="how-it-differs"><div class="wrap">` +
    `<div class="section-head"><span class="eyebrow">Choosing between toxins</span>` +
    `<h2>${heading}</h2><p>${lead}</p></div>` +
    `<div class="grid g3">${cards}</div>` +
    `<p class="disclaimer">Product selection is a clinical decision made with you at consultation. Nothing here is a recommendation for a specific product, and no toxin can be dosed from a web page.</p>` +
    `</div></section>`
  );
};

let changed = 0;
for (const [slug, p] of Object.entries(products)) {
  const file = path.join(out, `treatment-${slug}.html`);
  let html = fs.readFileSync(file, "utf8");
  const before = html;

  if (!SHARED_SUMMARY.test(html)) {
    console.log(`skip ${slug}: summary anchor not found (already rewritten?)`);
  } else {
    html = html.replace(SHARED_SUMMARY, `<p>${p.summary}</p>`);
  }

  if (!SHARED_CONCERNS.test(html)) {
    console.log(`skip ${slug}: concerns anchor not found (already rewritten?)`);
  } else {
    html = html.replace(
      SHARED_CONCERNS,
      `<h3>Concerns it may address</h3><ul>${p.concerns.map((c) => `<li>${c}</li>`).join("")}</ul>`,
    );
  }

  if (html.includes('id="how-it-differs"')) {
    console.log(`skip ${slug}: comparison section already present`);
  } else {
    // Insert directly after the "short answer" section that holds the summary.
    const anchor = '</div></section>\n<section class="alt"><div class="wrap"><div class="section-head"><span class="eyebrow">Candidacy</span>';
    const at = html.indexOf(anchor);
    if (at === -1) {
      console.log(`WARN ${slug}: could not place comparison section`);
    } else {
      const cut = at + "</div></section>".length;
      html = html.slice(0, cut) + compareSection(p.compare) + html.slice(cut);
    }
  }

  if (html !== before) {
    fs.writeFileSync(file, html);
    changed++;
    console.log(`ok   treatment-${slug}.html`);
  }
}
console.log(`\n${changed} file(s) rewritten`);
