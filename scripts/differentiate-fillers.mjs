// The five filler pages - juvederm, evolysse, radiesse, sculptra and lip-filler -
// shared one candidacy paragraph, one three-step process and one risk paragraph
// between them. That is clinically wrong, not just repetitive: Sculptra is a
// collagen stimulator given over several sessions with five days of patient
// homework after each one, Radiesse is a calcium hydroxylapatite implant whose
// labeling says its safety in the lips has not been established and which
// hyaluronidase cannot dissolve, and the hyaluronic-acid gels are the only ones
// in the group that can be reversed. A patient reading the Sculptra page was
// being told the Juvederm story.
//
// Every clinical statement below comes from the products' own FDA labeling:
//   Sculptra Aesthetic IFU (Galderma, PMA P030050)
//   RADIESSE Instructions for Use (PMA P050037 / P050052)
//   Juvederm and Evolysse patient labeling, already cited on those pages
//
// Same rules as differentiate-toxins.mjs: anchored on the exact text it
// replaces, skips anything it does not recognise, safe to re-run.
//
// The "why provider experience matters" block is deliberately left shared. It is
// a statement about how this practice works, not about a product, and forcing it
// to differ per page would be invention rather than differentiation.

import fs from "node:fs";
import path from "node:path";

const out = path.resolve("public");

const SHARED_CANDIDATE =
  "<h3>Who may be considered</h3><p>Adults seeking measured volume restoration or contour refinement may be candidates after an in-person medical and anatomic assessment. Good candidates have realistic goals and understand that product choice, amount and placement differ by facial region.</p>";

const SHARED_RISKS =
  "<h3>Risks &amp; limitations</h3><p>Common effects include swelling, tenderness, bruising, redness, firmness, lumps or asymmetry. Rare injection into a blood vessel can cause skin injury, scarring, stroke, vision changes or blindness. Delayed inflammation, infection, nodules and product migration can occur. Some complications may be permanent.</p>";

const SHARED_STEPS =
  '<div class="grid g3 steps"><div class="step"><h3>Evaluate</h3><p>The provider reviews history, examines facial proportions and discusses alternatives and emergency risks.</p></div><div class="step"><h3>Plan & treat</h3><p>The skin is cleansed and treatment landmarks are planned. Product is placed in small amounts using a needle or cannula as appropriate.</p></div><div class="step"><h3>Review & follow up</h3><p>The area is reassessed for symmetry and circulation. You receive written aftercare and urgent warning signs.</p></div></div>';

// Vascular occlusion is a risk of every injectable in this group and is stated
// on all five pages. What follows each product's shared sentence is what the
// product's own labeling adds.
const VASCULAR =
  "Common effects include swelling, tenderness, bruising, redness, firmness, lumps or asymmetry. Rare injection into a blood vessel can cause skin injury, scarring, stroke, vision changes or blindness.";

const steps = (a, b, c) =>
  `<div class="grid g3 steps"><div class="step"><h3>${a[0]}</h3><p>${a[1]}</p></div><div class="step"><h3>${b[0]}</h3><p>${b[1]}</p></div><div class="step"><h3>${c[0]}</h3><p>${c[1]}</p></div></div>`;

const products = {
  sculptra: {
    candidate:
      "Adults who want gradual, structural change rather than immediate volume, and who are willing to come back more than once. Sculptra&rsquo;s labeling describes one to four sessions, typically three, spaced at least three weeks apart, with optimal correction usually assessed around nine weeks after the first injection. A good candidate is comfortable with a result that is not visible when they leave, and is prepared to do the aftercare massage themselves.",
    steps: steps(
      ["Plan the series", "The provider assesses facial volume and agrees the likely number of sessions with you before the first one. This is a course of treatment, not a single appointment, and pricing is planned that way."],
      ["Treat and reconstitute", "Poly-L-lactic acid is reconstituted ahead of the session and placed in the deep dermis using a cross-hatch technique. It is a collagen stimulator, so nothing is being filled in the usual sense."],
      ["Massage, then wait", "The labeling asks you to massage each treated area for five minutes, five times a day, for five days after every session. Change develops over weeks as collagen responds; the next session is scheduled at least three weeks out."],
    ),
    risks:
      `${VASCULAR} Sculptra&rsquo;s own labeling notes that treatment can produce small subcutaneous papules, which are typically not visible and cause no symptoms, and that visible nodules &mdash; sometimes with redness or a change in skin colour &mdash; have been reported. Because it works by stimulating collagen rather than adding gel, it is not reversible with hyaluronidase, and it is not a spot filler for a single line.`,
  },

  radiesse: {
    candidate:
      "Adults with moderate-to-severe facial wrinkles and folds, such as nasolabial folds, who want immediate structural correction from a non-hyaluronic-acid material. Radiesse is also labeled for restoring facial fat loss in people with HIV. It is a poor fit for anyone who wants the option of dissolving the result later, and its labeling states that safety and effectiveness in the lips have not been established.",
    steps: steps(
      ["Evaluate", "The provider examines the folds and contours you want treated and confirms the area is one Radiesse is labeled for. If your goal is the lips, you will be offered a different product."],
      ["Place subdermally", "Radiesse is a calcium hydroxylapatite implant &mdash; particles of 25 to 45 microns suspended in a gel carrier &mdash; placed subdermally by needle or cannula. Correction is visible immediately."],
      ["Review and follow up", "The area is reassessed for symmetry and circulation. You receive written aftercare and the urgent warning signs. The gel carrier resorbs over time while the collagen response continues."],
    ),
    risks:
      `${VASCULAR} Radiesse is calcium hydroxylapatite rather than a hyaluronic-acid gel, which has one consequence worth understanding before you agree to it: hyaluronidase will not dissolve it. A result you dislike is managed rather than reversed. Its labeling also states that safety and effectiveness in the lips have not been established, and that nodules have been reported in published accounts of lip injection.`,
  },

  juvederm: {
    candidate:
      "Adults seeking volume, contour or lip refinement with a hyaluronic-acid gel. The Juv&eacute;derm family covers different areas with different products &mdash; lips, cheeks, chin, jawline, folds &mdash; and the right one is chosen by area and by how firm the gel needs to be, not by brand preference. Candidates should understand that the result is temporary and that maintenance is a choice, not an obligation.",
    steps: steps(
      ["Match product to area", "Each Juv&eacute;derm product is approved for particular areas and depths. The provider selects by where you want change and how much structure that area needs, and will say when a different product fits better."],
      ["Place in small amounts", "The skin is cleansed and landmarks planned. Gel is placed in small increments by needle or cannula, reassessing as it goes rather than committing a full syringe at once."],
      ["Review and follow up", "The area is checked for symmetry and circulation. You receive written aftercare and urgent warning signs. Swelling settles over the following days, so final judgement waits."],
    ),
    risks:
      `${VASCULAR} Delayed inflammation, infection, nodules and product migration can occur, and some complications may be permanent. Because Juv&eacute;derm is a hyaluronic-acid gel, hyaluronidase can be used to dissolve it &mdash; which is a genuine safety tool in an emergency as well as a remedy for a result you are unhappy with, and one of the real arguments for choosing an HA product.`,
  },

  evolysse: {
    candidate:
      "Adults with moderate-to-severe dynamic facial wrinkles and folds, such as nasolabial folds, who want a hyaluronic-acid option. Evolysse is FDA-approved for dermal and subdermal injection in adults aged 22 and over. As a newer product family it has a shorter real-world track record than the longest-established gels, which is a reasonable thing to weigh rather than something to talk you out of.",
    steps: steps(
      ["Confirm the indication", "The provider checks that what you want treated matches what the selected Evolysse product is approved for &mdash; dynamic wrinkles and folds &mdash; and discusses the alternatives honestly, including established products."],
      ["Place by depth", "Approval covers dermal and subdermal injection. Gel is placed at the depth the area calls for, in small amounts, reassessing as it goes."],
      ["Review and follow up", "The area is reassessed for symmetry and circulation, with written aftercare and urgent warning signs. Durability varies by product, area and patient, so maintenance is planned individually."],
    ),
    risks:
      `${VASCULAR} Delayed inflammation, infection, nodules and product migration can occur, and some complications may be permanent. Evolysse is a hyaluronic-acid gel, so hyaluronidase can dissolve it if that becomes necessary. Its clinical durability varies by product and by patient, and anyone quoting you a fixed number of months is guessing.`,
  },

  "lip-filler": {
    candidate:
      "Adults who want change to lip shape, border, balance or volume, and who can say what they actually want &mdash; hydration, definition, proportion, or size. Lip filler is an application rather than a product: an appropriately labeled hyaluronic-acid gel selected for the lips specifically. Radiesse, by contrast, is not a lip product; its labeling states that safety and effectiveness in the lips have not been established.",
    steps: steps(
      ["Define the goal", "The provider looks at the whole lower face, not only the lips, and asks what you want to change. Photographs of other people&rsquo;s lips are useful for direction and misleading as targets, because the surrounding anatomy is not yours."],
      ["Treat conservatively", "A hyaluronic-acid product labeled for the lips is placed in small amounts, usually building toward the goal over more than one visit rather than reaching it in a single appointment."],
      ["Let swelling settle", "Lips swell more than most areas and can look substantially fuller for several days. The area is checked for symmetry and circulation, and final judgement waits until the swelling has gone."],
    ),
    risks:
      `${VASCULAR} The lips and the skin around them are a high-risk area for vascular events, which is why the product is placed slowly and in small amounts. Delayed inflammation, infection, nodules, product migration above the lip border and asymmetry can occur, and some complications may be permanent. Because these are hyaluronic-acid gels, hyaluronidase can dissolve the result if you want it undone.`,
  },
};

let changed = 0;
for (const [slug, p] of Object.entries(products)) {
  const file = path.join(out, `treatment-${slug}.html`);
  if (!fs.existsSync(file)) {
    console.log(`skip ${slug}: no such page`);
    continue;
  }
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  const misses = [];

  if (html.includes(SHARED_CANDIDATE)) {
    html = html.replace(SHARED_CANDIDATE, `<h3>Who may be considered</h3><p>${p.candidate}</p>`);
  } else misses.push("candidate");

  if (html.includes(SHARED_STEPS)) {
    html = html.replace(SHARED_STEPS, p.steps);
  } else misses.push("process");

  if (html.includes(SHARED_RISKS)) {
    html = html.replace(SHARED_RISKS, `<h3>Risks &amp; limitations</h3><p>${p.risks}</p>`);
  } else misses.push("risks");

  if (misses.length) console.log(`note ${slug}: anchors not found for ${misses.join(", ")} (already rewritten?)`);

  if (html !== before) {
    fs.writeFileSync(file, html);
    changed++;
    console.log(`ok   treatment-${slug}.html`);
  }
}
console.log(`\n${changed} file(s) rewritten`);
