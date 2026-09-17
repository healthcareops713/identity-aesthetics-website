// The four city pages carried the same vague sentence - "Service availability
// can vary by location. If something you want is not offered in X, we will tell
// you which location or telehealth pathway fits" - which tells a patient
// nothing and gives search engines nothing. The practice knows exactly how the
// locations differ, so the pages now say it.
//
// Facts supplied by the practice on 2026-09-17:
//   - Conroe is the marquee location and the only site with the Sciton
//     JOULE/Profile platform (BBL and Er:YAG resurfacing) and HIFU vaginal
//     rejuvenation.
//   - Every other treatment is available everywhere. The laser hair removal and
//     laser rejuvenation systems are portable and travel between sites.
//   - Every provider sees patients at every location, and all of them offer
//     telehealth for every location. No fixed days or site assignments.
//   - Fulshear sits in the business cottages behind the original post office.
//     Every other site has open, clearly marked parking.
//
// Same safety rules as the other transforms: anchored on the text it replaces,
// every replacement checked so it cannot remove more than it matched,
// idempotent, and it skips anything it does not recognise.

import fs from "node:fs";
import path from "node:path";

const out = path.resolve("public");

const VAGUE = (city) =>
  `Service availability can vary by location. If something you want is not offered in ${city}, we will tell you which location or telehealth pathway fits.`;

// Appended to the "Visiting this location" list.
const parkingItem = (text) => `<li><b>Parking:</b> ${text}</li>`;

const PROVIDERS =
  "Every provider sees patients at every location, and any of them can see you by telehealth anywhere in Texas, North Carolina or South Carolina. Nobody is tied to one site and there are no fixed days, so choose the clinic that is convenient rather than the one you think has the right person on the right afternoon.";

const CONROE_ONLY =
  "Two things are available at our Conroe location and nowhere else: the Sciton JOULE/Profile platform, which covers BBL BroadBand Light and Er:YAG facial resurfacing, and HIFU vaginal rejuvenation.";

const PORTABLE =
  "Laser hair removal and laser rejuvenation are available here &mdash; those systems are portable and travel between our locations.";

const cities = {
  conroe: {
    city: "Conroe",
    replacement: `${CONROE_ONLY} Everything else on our menu is available at every location. ${PROVIDERS}`,
    parking: "Open parking on site, clearly marked.",
    extraCards:
      '<article class="card"><h3><a href="treatment-sciton-profile-bbl">Sciton JOULE / Profile</a></h3><p>BBL BroadBand Light and Er:YAG resurfacing &mdash; Conroe only</p></article>' +
      '<article class="card"><h3><a href="treatment-vaginal-rejuvenation-hifu">Vaginal Rejuvenation</a></h3><p>HIFU treatment &mdash; Conroe only</p></article>',
    lastCard:
      '<article class="card"><h3><a href="treatment-hair-restoration">Hair Restoration</a></h3><p>Keralase and PRP for thinning hair</p></article>',
  },
  houston: {
    city: "Houston",
    replacement: `Our full menu is available here, with two exceptions. ${CONROE_ONLY} ${PORTABLE} ${PROVIDERS}`,
    parking: "Open parking on site, clearly marked.",
  },
  fulshear: {
    city: "Fulshear",
    replacement: `Our full menu is available here, with two exceptions. ${CONROE_ONLY} ${PORTABLE} ${PROVIDERS}`,
    parking:
      "In the business cottages behind the original post office. Open parking &mdash; if you are looking at the post office, we are behind it.",
  },
  katy: {
    city: "Katy",
    replacement: `Our full menu is available here, with two exceptions. ${CONROE_ONLY} ${PORTABLE} ${PROVIDERS}`,
    parking: "Open parking, clearly marked. We are on the second floor of the Grand West building.",
  },
};

let changed = 0;
for (const [slug, c] of Object.entries(cities)) {
  const file = path.join(out, `botox-${slug}-tx.html`);
  if (!fs.existsSync(file)) { console.log(`skip ${slug}: no such page`); continue; }
  const original = fs.readFileSync(file, "utf8");
  let html = original;
  const notes = [];

  const apply = (label, needle, replacement) => {
    if (!html.includes(needle)) { notes.push(label); return; }
    const next = html.replace(needle, replacement);
    if (original.length - next.length > needle.length) { notes.push(`${label} (unsafe, skipped)`); return; }
    html = next;
  };

  apply("availability", VAGUE(c.city), c.replacement);

  // Parking goes after the Email line in the "Visiting this location" card.
  const emailItem = '<li><b>Email:</b> <a href="mailto:info@713botoxme.com">info@713botoxme.com</a></li>';
  if (html.includes(parkingItem(c.parking))) notes.push("parking (already present)");
  else apply("parking", emailItem, emailItem + parkingItem(c.parking));

  if (c.extraCards) {
    if (html.includes(c.extraCards)) notes.push("exclusive cards (already present)");
    else apply("exclusive cards", c.lastCard, c.lastCard + c.extraCards);
  }

  if (notes.length) console.log(`note ${slug}: ${notes.join(", ")}`);
  if (html !== original) {
    console.log(`     ${slug}: +${html.length - original.length} bytes`);
    fs.writeFileSync(file, html);
    changed++;
    console.log(`ok   botox-${slug}-tx.html`);
  }
}
console.log(`\n${changed} file(s) rewritten`);
