// The last duplicate cluster: treatment-laser-rejuvenation and
// treatment-sciton-profile-bbl shared one candidacy paragraph, one
// contraindications paragraph, one three-step process and one risk paragraph.
//
// They are not the same kind of page. The Sciton page is about one platform and
// already carries its own modality comparison: BBL is filter-selected broadband
// light, ProFractional is a fractional 2940 nm Er:YAG laser, Contour TRL is a
// tunable 2940 nm Er:YAG, with recovery ranging from little downtime to two to
// four weeks for deeper full-field treatment. The laser rejuvenation page is a
// decision page - an umbrella over devices the practice may or may not own - and
// its honest job is to send someone into a consultation asking better questions,
// not to imply a candidacy decision it cannot make.
//
// The copy below is consistent with the modality table already on the Sciton
// page rather than introducing new clinical claims.
//
// Anchored, idempotent, skips what it does not recognise.

import fs from "node:fs";
import path from "node:path";

const out = path.resolve("public");

// Two of these pages are pretty-printed with newlines between tags and one uses
// a literal curly apostrophe, so anchors are matched as whitespace-tolerant
// regexes on their own text rather than as exact strings.
const CANDIDATE_RE =
  /<h3>Who may be considered<\/h3>\s*<p>Candidates are selected by skin type, diagnosis, recent sun exposure, medications, healing history and the available device(?:&rsquo;|\u2019)s cleared indications\.[\s\S]*?<\/p>/;

const RISKS_RE =
  /<h3>Risks &amp; limitations<\/h3>\s*<p>Temporary redness, swelling, dryness or pigment darkening can occur\.[\s\S]*?<\/p>/;

// The three-step block is matched by the step headings it actually contains.
// A structural match on "</div></div>" is unsafe: on a pretty-printed page the
// first such pair can sit thousands of characters later and swallow whole
// sections of the document.
const STEPS_RE =
  /<div class="grid g3 steps">\s*<div class="step">\s*<h3>Evaluate<\/h3>[\s\S]{0,1200}?<h3>Review & follow up<\/h3>\s*<p>[\s\S]*?<\/p>\s*<\/div>\s*<\/div>/;

const BASE_RISK =
  "Temporary redness, swelling, dryness or pigment darkening can occur. Burns, blistering, prolonged pigment change, infection and scarring are uncommon but important risks. Results vary with device, settings, skin type, concern and aftercare; treatment does not stop future aging or sun damage.";

const AVOID_RE =
  /<h3>When treatment may not be appropriate<\/h3>\s*<p>Treatment may be deferred for recent sun exposure or a fresh tan[\s\S]*?<\/p>/;

const steps = (a, b, c) =>
  `<div class="grid g3 steps"><div class="step"><h3>${a[0]}</h3><p>${a[1]}</p></div><div class="step"><h3>${b[0]}</h3><p>${b[1]}</p></div><div class="step"><h3>${c[0]}</h3><p>${c[1]}</p></div></div>`;

const pages = {
  "sciton-profile-bbl": {
    candidate:
      "Candidates are selected first by which pathway suits the problem, then by whether they suit that pathway. BBL is filter-selected broadband light and usually asks little of your calendar; ProFractional and Contour TRL are 2940 nm Er:YAG resurfacing, and deeper full-field treatment commonly means two to four weeks of visible healing. A good candidate has been told which of those they are having, and has the recovery time it actually requires.",
    avoid:
      "Treatment may be deferred for recent sun exposure or a fresh tan, active infection or a cold-sore outbreak in the treatment area, certain photosensitising medications, pregnancy, or a healing history that suggests poor wound outcomes. Tell the provider about every medication and supplement, any history of cold sores, any keloid or abnormal scarring, and any previous energy-based treatment and how your skin responded to it.",
    steps: steps(
      ["Choose the pathway", "The provider decides between light and laser before deciding on settings. Colour and sun damage point toward BBL; texture, scarring and wrinkles point toward ProFractional or Contour TRL, and some plans combine them."],
      ["Treat at agreed settings", "Eye protection is worn. Settings are chosen for your skin type and the concern, and the endpoint the provider is watching for is explained to you beforehand rather than described afterwards."],
      ["Heal on the pathway&rsquo;s timeline", "After BBL, pigment commonly darkens before it clears. After ablative resurfacing the skin heals as a wound, with strict sun avoidance and written aftercare. You are given the recovery your pathway actually has, not an average of all of them."],
    ),
    risks: `${BASE_RISK} Two pathway-specific points are worth stating plainly. After BBL, treated brown pigment typically darkens and flakes before it clears, which is expected rather than a complication. After ablative Er:YAG resurfacing the skin surface is removed and heals as a wound, so infection and reactivation of cold sores are real risks, and deeper full-field treatment commonly means two to four weeks before you look like yourself again.`,
  },

  "laser-rejuvenation": {
    candidate:
      "This page cannot tell you whether you are a candidate, and any page that claims to is selling something. Candidacy for energy-based treatment depends on the specific device and wavelength, your skin type, recent sun exposure, medications, healing history, and what the device is actually cleared to treat. Darker skin can be treated well with some technologies and injured by others. What a good candidate arrives with is the right question: which device, at what wavelength, for which diagnosis.",
    avoid:
      "Treatment may be deferred for recent sun exposure or a fresh tan, active infection in the treatment area, certain photosensitising medications, pregnancy, or a healing history that suggests poor wound outcomes. One warning sign is worth knowing: if a clinic will not name the device, the wavelength and the concern it is being used for, that is a reason to keep asking rather than to book.",
    steps: steps(
      ["Name the technology", "A consultation should identify the device and wavelength being proposed and what it is cleared to treat. &ldquo;Laser&rdquo; is a category, not a treatment, and broadband light is not a laser at all."],
      ["Match it to the diagnosis", "Pigment, redness, texture and scarring are different problems and respond to different energy. The provider should say which of them they are treating and what they are not treating."],
      ["Stage the plan", "Most skin goals are a course rather than a single session, and downtime varies enormously by device &mdash; from almost none to weeks. You should know the number of sessions and the recovery before the first one."],
    ),
    risks: `${BASE_RISK} The honest limitation of this page is that your risk profile depends on which device is used on you. A treatment with almost no downtime and a treatment that removes the skin surface both sit under the word &ldquo;laser&rdquo;, and they do not carry the same risks. Ask for the specific device&rsquo;s risks in your consultation, and be cautious of anyone who answers in generalities.`,
  },
};

let changed = 0;
for (const [slug, p] of Object.entries(pages)) {
  const file = path.join(out, `treatment-${slug}.html`);
  if (!fs.existsSync(file)) { console.log(`skip ${slug}: no such page`); continue; }
  const original = fs.readFileSync(file, "utf8");
  let html = original;
  const misses = [];

  const apply = (label, re, replacement) => {
    const m = html.match(re);
    if (!m) { misses.push(label); return; }
    // A replacement must not remove more than the block it matched.
    const next = html.replace(m[0], replacement);
    const removed = html.length - next.length + replacement.length;
    if (removed > m[0].length) { misses.push(`${label} (unsafe match, skipped)`); return; }
    html = next;
  };

  apply("candidate", CANDIDATE_RE, `<h3>Who may be considered</h3><p>${p.candidate}</p>`);
  if (p.avoid) apply("avoid", AVOID_RE, `<h3>When treatment may not be appropriate</h3><p>${p.avoid}</p>`);
  apply("process", STEPS_RE, p.steps);
  apply("risks", RISKS_RE, `<h3>Risks &amp; limitations</h3><p>${p.risks}</p>`);

  if (misses.length) console.log(`note ${slug}: ${misses.join(", ")}`);

  if (html !== original) {
    const delta = html.length - original.length;
    console.log(`     ${slug}: ${delta >= 0 ? "+" : ""}${delta} bytes`);
    fs.writeFileSync(file, html);
    changed++;
    console.log(`ok   treatment-${slug}.html`);
  }
}
console.log(`\n${changed} file(s) rewritten`);
