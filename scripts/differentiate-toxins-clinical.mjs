// Second pass on the four neurotoxin pages. The earlier pass (differentiate-
// toxins.mjs) gave each product its own opening answer, concerns list and
// comparison section. This one takes the clinical blocks underneath that were
// still identical across all four: who may be considered, when treatment may
// not be appropriate, the three-step process, and risks.
//
// Every product-specific statement comes from that product's own FDA labeling:
//   BOTOX Cosmetic  - glabellar, lateral canthal, forehead and platysma bands
//   DYSPORT         - glabellar lines in adults < 65; contraindicated in known
//                     hypersensitivity to cow's milk protein, which the product
//                     may contain in trace amounts
//   XEOMIN          - glabellar, forehead and lateral canthal lines; the active
//                     neurotoxin separated from its accessory proteins
//   JEUVEAU         - glabellar lines only, with a boxed warning stating it is
//                     not approved for spasticity or any other condition
//
// The class-wide safety language stays on all four pages: the boxed warning
// about distant spread of toxin effect, the swallowing/speaking/breathing
// warning, and the rule that units of one product cannot be converted into
// units of another. Differentiation must not thin out a warning.
//
// Anchored, idempotent, skips what it does not recognise.

import fs from "node:fs";
import path from "node:path";

const out = path.resolve("public");

const SHARED_CANDIDATE =
  "<h3>Who may be considered</h3><p>Adults seeking temporary improvement in expression lines may be considered after an in-person facial assessment. A good candidate understands that results are temporary, asymmetry is possible, and the safest dose depends on muscle strength, anatomy, prior response and treatment goals.</p>";

const SHARED_AVOID =
  "<h3>When treatment may not be appropriate</h3><p>Treatment may be deferred for pregnancy or breastfeeding, active infection at an injection site, known allergy to an ingredient, certain neuromuscular disorders, or symptoms that require medical evaluation. Tell the provider about all medications, supplements, prior toxin products and any swallowing or breathing problems.</p>";

const SHARED_STEPS =
  '<div class="grid g3 steps"><div class="step"><h3>Evaluate</h3><p>Your provider reviews health history, prior toxin use, facial movement and goals.</p></div><div class="step"><h3>Plan & treat</h3><p>Expression patterns are mapped and the skin is cleansed. Small measured injections are placed with a fine needle.</p></div><div class="step"><h3>Review & follow up</h3><p>You receive individualized aftercare and a timing window for follow-up. Do not judge symmetry before the product has had time to settle.</p></div></div>';

const SHARED_RISKS =
  "<h3>Risks &amp; limitations</h3><p>Expected effects can include temporary redness, tenderness, bruising, swelling or asymmetry. Rare but serious botulinum-toxin risks include swallowing, speaking or breathing difficulty and spread of toxin effect. Product units are not interchangeable. Treatment cannot be guaranteed and must follow an individualized examination.</p>";

// Class-wide language that must survive on every one of the four pages.
const CLASS_RISK =
  "Expected effects can include temporary redness, tenderness, bruising, swelling or asymmetry. Every botulinum toxin product carries a boxed warning about distant spread of toxin effect: rare but serious risks include swallowing, speaking or breathing difficulty. Units of one product cannot be compared to or converted into units of another. Treatment cannot be guaranteed and must follow an individualized examination.";

const COMMON_AVOID =
  "Treatment may be deferred for pregnancy or breastfeeding, active infection at an injection site, known allergy to an ingredient, certain neuromuscular disorders, or symptoms that require medical evaluation. Tell the provider about all medications, supplements, prior toxin products and any swallowing or breathing problems.";

const steps = (a, b, c) =>
  `<div class="grid g3 steps"><div class="step"><h3>${a[0]}</h3><p>${a[1]}</p></div><div class="step"><h3>${b[0]}</h3><p>${b[1]}</p></div><div class="step"><h3>${c[0]}</h3><p>${c[1]}</p></div></div>`;

const products = {
  botox: {
    candidate:
      "Adults who want expression lines softened across more than one area. Botox&reg; Cosmetic has the widest cosmetic labeling of the four toxins we carry &mdash; glabellar lines, crow&rsquo;s feet, forehead lines and platysma bands in the neck &mdash; so a plan that spans the upper face, or reaches the neck, sits within what the product is approved for. A good candidate understands that the result is temporary, that asymmetry is possible, and that the safest dose depends on muscle strength, anatomy and how they responded last time.",
    avoid: `${COMMON_AVOID} Because the label covers several areas, a multi-area plan adds up: the total dose is decided as one number for the visit, not area by area.`,
    steps: steps(
      ["Map the movement", "Your provider watches how your face actually moves &mdash; frowning, raising, squinting &mdash; and reviews prior toxin use and goals. The neck is assessed separately from the brow, because it is a different muscle problem."],
      ["Plan the whole dose", "Areas are prioritised and the total dose for the visit is agreed before anything is injected. Small measured injections are placed with a fine needle."],
      ["Review and follow up", "You receive aftercare and a follow-up window. Movement changes over the first days to two weeks, so symmetry is not judged on the way out of the door."],
    ),
    risks: CLASS_RISK,
  },

  dysport: {
    candidate:
      "Adults under 65 with moderate-to-severe glabellar lines &mdash; the age range is how Dysport&reg;&rsquo;s cosmetic indication is actually written, and it is the only one of the four labeled that way. A good candidate understands that the result is temporary, that asymmetry is possible, and that a Dysport&reg; dose is counted on its own scale rather than converted from a dose of something else.",
    avoid: `${COMMON_AVOID} Dysport&reg; carries one contraindication the others do not: its labeling states it is contraindicated in patients with known hypersensitivity to cow&rsquo;s milk protein, which the product may contain in trace amounts. Tell the provider if you have a milk protein allergy, even a mild one.`,
    steps: steps(
      ["Assess the frown complex", "Your provider reviews health history, prior toxin use and how the muscles between your brows behave. Dysport&reg;&rsquo;s cosmetic labeling covers this area specifically."],
      ["Explain the unit count", "A Dysport&reg; plan involves a visibly larger number of units than the equivalent plan in another toxin. That is the scale, not the strength, and per-unit price across two different products is not a like-for-like comparison."],
      ["Treat and follow up", "Small measured injections are placed with a fine needle, then aftercare and a follow-up window. Give it up to two weeks before judging the result."],
    ),
    risks: CLASS_RISK,
  },

  xeomin: {
    candidate:
      "Adults who want the upper face treated &mdash; Xeomin&reg;&rsquo;s cosmetic labeling covers glabellar lines, forehead lines and lateral canthal lines in adults &mdash; and anyone who would rather have a formulation without the accessory proteins that accompany the other three. A good candidate understands that the result is temporary, that asymmetry is possible, and that the dose is built from their own anatomy rather than translated from a previous product.",
    avoid: COMMON_AVOID,
    steps: steps(
      ["Assess the upper face", "Your provider reviews health history, prior toxin use and how your brow, forehead and outer eye move. All three areas sit within what Xeomin&reg; is labeled for."],
      ["Plan a fresh dose", "Xeomin&reg; is the purified toxin, separated from its hemagglutinin and non-hemagglutinin proteins. Switching to it from another product means a new dose plan, not a converted one; its label is explicit that units are not comparable between products."],
      ["Treat and follow up", "Small measured injections with a fine needle, then aftercare and a follow-up window. Movement settles over the first two weeks."],
    ),
    risks: CLASS_RISK,
  },

  jeuveau: {
    candidate:
      "Adults who want the frown lines between their brows treated, and nothing else on this visit. Jeuveau&reg;&rsquo;s indication is the glabellar complex &mdash; the corrugator and procerus muscles &mdash; and its boxed warning states plainly that it is not approved for spasticity or any condition other than glabellar lines. A good candidate understands the result is temporary, that asymmetry is possible, and that a narrow label is a reason for confidence in that area rather than a limitation.",
    avoid: `${COMMON_AVOID} If your goal is the forehead, the outer eye or the neck, Jeuveau&reg; is not the product for it and your provider will say so.`,
    steps: steps(
      ["Assess the glabella", "Your provider reviews health history, prior toxin use and how the corrugator and procerus muscles pull when you frown. This is the area Jeuveau&reg; is approved for."],
      ["Treat the area", "Expression patterns are mapped and the skin is cleansed. Small measured injections are placed with a fine needle, dosed from your own muscle strength rather than converted from another product."],
      ["Review and follow up", "You receive aftercare and a follow-up window. Do not judge symmetry before the product has had time to settle, which can take up to two weeks."],
    ),
    risks: CLASS_RISK,
  },
};

let changed = 0;
for (const [slug, p] of Object.entries(products)) {
  const file = path.join(out, `treatment-${slug}.html`);
  if (!fs.existsSync(file)) { console.log(`skip ${slug}: no such page`); continue; }
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  const misses = [];

  if (html.includes(SHARED_CANDIDATE)) html = html.replace(SHARED_CANDIDATE, `<h3>Who may be considered</h3><p>${p.candidate}</p>`);
  else misses.push("candidate");

  if (html.includes(SHARED_AVOID)) html = html.replace(SHARED_AVOID, `<h3>When treatment may not be appropriate</h3><p>${p.avoid}</p>`);
  else misses.push("avoid");

  if (html.includes(SHARED_STEPS)) html = html.replace(SHARED_STEPS, p.steps);
  else misses.push("process");

  if (html.includes(SHARED_RISKS)) html = html.replace(SHARED_RISKS, `<h3>Risks &amp; limitations</h3><p>${p.risks}</p>`);
  else misses.push("risks");

  if (misses.length) console.log(`note ${slug}: anchors not found for ${misses.join(", ")} (already rewritten?)`);
  if (html !== before) { fs.writeFileSync(file, html); changed++; console.log(`ok   treatment-${slug}.html`); }
}
console.log(`\n${changed} file(s) rewritten`);
