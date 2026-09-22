// Both physicians were titled plain "Chief Medical Officer" everywhere - on the
// team page, in their bios, in every page's review block and in the Person
// schema on ~80 pages. Two people holding the same title with nothing to tell
// them apart reads as a contradiction to a patient and to a search engine.
//
// Titles supplied by the practice on 2026-09-22:
//   Dallas Alvey, MD, DDS  - Chief Medical Officer – Texas
//   Ike Nwanonyiri, MD     - Chief Medical Officer – North & South Carolina
//
// Labels and schema use the dash form. Running prose uses "Chief Medical Officer
// for Texas" / "for North and South Carolina", which reads naturally in a
// sentence and needs no ampersand escaping in meta descriptions.
//
// Same transform rules as the other scripts: every rule is anchored on the exact
// text it replaces, including enough of its surroundings to know which doctor
// it belongs to; a replacement's size change is checked; already-applied rules
// are recognised and skipped, so the script is idempotent; anything it does not
// recognise is reported rather than guessed at.

import fs from "node:fs";
import path from "node:path";

const TX = "Chief Medical Officer – Texas";
const CAR = "Chief Medical Officer – North & South Carolina";
const CAR_HTML = "Chief Medical Officer – North &amp; South Carolina";
const TX_PROSE = "Chief Medical Officer for Texas";
const CAR_PROSE = "Chief Medical Officer for North and South Carolina";

// [label, from, to, files ("*" = every public html page)]
const RULES = [
  // ---- structured data -------------------------------------------------------
  ["Dallas Person schema",
    '"name":"Dallas Alvey, MD, DDS","honorificSuffix":"MD, DDS","jobTitle":"Chief Medical Officer"',
    `"name":"Dallas Alvey, MD, DDS","honorificSuffix":"MD, DDS","jobTitle":"${TX}"`, "*"],
  ["Dallas reviewer schema (short form)",
    '"name":"Dallas Alvey, MD, DDS","jobTitle":"Chief Medical Officer"',
    `"name":"Dallas Alvey, MD, DDS","jobTitle":"${TX}"`, "*"],
  ["Ike Person schema",
    '"name":"Ike Nwanonyiri, MD","honorificSuffix":"MD","jobTitle":"Chief Medical Officer"',
    `"name":"Ike Nwanonyiri, MD","honorificSuffix":"MD","jobTitle":"${CAR}"`, "*"],

  // ---- review blocks on treatment and education pages ------------------------
  ["Dallas review block",
    '<a href="team-dallas-alvey">Dallas Alvey, MD, DDS</a><p>Chief Medical Officer ·',
    `<a href="team-dallas-alvey">Dallas Alvey, MD, DDS</a><p>${TX} ·`, "*"],
  ["Dallas inline reviewer line",
    "Dallas Alvey, MD, DDS, Chief Medical Officer</span>",
    `Dallas Alvey, MD, DDS, ${TX}</span>`, "*"],
  ["journal author card",
    "<p>Chief Medical Officer at Identity Aesthetics with dual",
    `<p>${TX_PROSE} at Identity Aesthetics with dual`, "*"],

  // ---- editorial policy --------------------------------------------------------
  ["editorial policy: Dallas",
    "Dallas Alvey, MD, DDS</strong></a>, Chief Medical Officer, and",
    `Dallas Alvey, MD, DDS</strong></a>, ${TX}, and`, ["editorial-policy.html"]],
  ["editorial policy: Ike",
    "Ike Nwanonyiri, MD</strong></a>, Chief Medical Officer, with",
    `Ike Nwanonyiri, MD</strong></a>, ${CAR_HTML}, with`, ["editorial-policy.html"]],

  // ---- team page ---------------------------------------------------------------
  ["team intro",
    "Our Chief Medical Officers establish the clinical vision",
    "Our two Chief Medical Officers&mdash;Dallas Alvey, MD, DDS, for Texas and Ike Nwanonyiri, MD, for North and South Carolina&mdash;establish the clinical vision",
    ["team.html"]],
  ["team card: Ike",
    '<span class="team-role">Chief Medical Officer</span><h3>Ike Nwanonyiri, MD</h3>',
    `<span class="team-role">${CAR_HTML}</span><h3>Ike Nwanonyiri, MD</h3>`, ["team.html"]],
  ["team card: Dallas",
    '<span class="team-role">Chief Medical Officer</span><h3>Dallas Alvey, MD, DDS</h3>',
    `<span class="team-role">${TX}</span><h3>Dallas Alvey, MD, DDS</h3>`, ["team.html"]],

  // ---- Dallas Alvey profile ------------------------------------------------------
  ["Dallas <title>",
    "<title>Dallas Alvey, MD, DDS | Chief Medical Officer</title>",
    `<title>Dallas Alvey, MD, DDS | ${TX}</title>`, ["team-dallas-alvey.html"]],
  ["Dallas og/twitter titles",
    'content="Dallas Alvey, MD, DDS | Chief Medical Officer"',
    `content="Dallas Alvey, MD, DDS | ${TX}"`, ["team-dallas-alvey.html"]],
  ["Dallas meta descriptions",
    "Meet Dallas Alvey, MD, DDS, Chief Medical Officer at Identity Aesthetics",
    `Meet Dallas Alvey, MD, DDS, ${TX_PROSE} at Identity Aesthetics`, ["team-dallas-alvey.html"]],
  ["Dallas profile title line",
    '<p class="profile-title">Medical Leadership · Aesthetic, Hormone and Wellness Medicine</p>',
    `<p class="profile-title">${TX} · Aesthetic, Hormone and Wellness Medicine</p>`, ["team-dallas-alvey.html"]],
  ["Dallas bio sentence",
    "As part of the medical leadership at Identity Aesthetics, Dr. Alvey helps oversee",
    `As ${TX_PROSE} and part of the medical leadership at Identity Aesthetics, Dr. Alvey helps oversee`,
    ["team-dallas-alvey.html"]],

  // ---- Ike Nwanonyiri profile -----------------------------------------------------
  ["Ike description and bio",
    "family medicine physician and Chief Medical Officer at Identity Aesthetics",
    `family medicine physician and ${CAR_PROSE} at Identity Aesthetics`, ["team-ike-nwanonyiri.html"]],
  ["Ike og/twitter descriptions",
    "family medicine physician and Identity Aesthetics Chief Medical Officer with experience",
    `family medicine physician and Identity Aesthetics ${CAR_PROSE} with experience`, ["team-ike-nwanonyiri.html"]],
  ["Ike profile title line",
    '<p class="profile-title">Chief Medical Officer · Board-Certified Family Medicine Physician',
    `<p class="profile-title">${CAR_HTML} · Board-Certified Family Medicine Physician`, ["team-ike-nwanonyiri.html"]],
];

// Non-page files: [label, file, from, to]
const OTHER = [
  ["search: Dallas title", "public/site-enhancements.js",
    '{title:"Dallas Alvey, MD, DDS, Chief Medical Officer",',
    `{title:"Dallas Alvey, MD, DDS, ${TX}",`],
  ["search: Dallas description", "public/site-enhancements.js",
    'description:"Chief Medical Officer with dual medical',
    `description:"${TX_PROSE} with dual medical`],
  ["search: Ike description", "public/site-enhancements.js",
    'description:"Board-certified family medicine physician and Chief Medical Officer with experience',
    `description:"Board-certified family medicine physician and ${CAR_PROSE} with experience`],
  ["menu: medical leadership", "public/site-enhancements.js",
    '[["Dallas Alvey, MD, DDS, Chief Medical Officer", "team-dallas-alvey"], ["Ike Nwanonyiri, MD", "team-ike-nwanonyiri"]',
    '[["Dallas Alvey, MD, DDS, Chief Medical Officer – Texas", "team-dallas-alvey"], ["Ike Nwanonyiri, MD, Chief Medical Officer – North &amp; South Carolina", "team-ike-nwanonyiri"]'],
  ["llms: Ike", "public/llms.txt",
    "Board-certified family medicine physician and Chief Medical Officer with education",
    `Board-certified family medicine physician and ${CAR_PROSE} with education`],
  ["llms: editorial review names", "public/llms.txt",
    "medically reviewed by Dallas Alvey, MD, DDS, and Ike Nwanonyiri, MD;",
    `medically reviewed by Dallas Alvey, MD, DDS, ${TX_PROSE}, and Ike Nwanonyiri, MD, ${CAR_PROSE};`],
  ["generator: Dallas", "scripts/enhance-authority.mjs",
    "jobTitle:'Chief Medical Officer',url:`${base}/team-dallas-alvey",
    `jobTitle:'${TX}',url:\`\${base}/team-dallas-alvey`],
  ["generator: Ike", "scripts/enhance-authority.mjs",
    "['Ike Nwanonyiri, MD','MD','Chief Medical Officer']",
    `['Ike Nwanonyiri, MD','MD','${CAR}']`],
  ["generator: review block", "scripts/enhance-authority.mjs",
    '<a href="team-dallas-alvey">Dallas Alvey, MD, DDS</a><p>Chief Medical Officer ·',
    `<a href="team-dallas-alvey">Dallas Alvey, MD, DDS</a><p>${TX} ·`],
  ["ED page builder: Ike", "scripts/build-ed-page.mjs",
    'jobTitle: "Chief Medical Officer",',
    `jobTitle: "${CAR}",`],
];

const pub = path.resolve("public");
const pages = fs.readdirSync(pub).filter((f) => f.endsWith(".html"));
const tally = new Map();
const changedFiles = new Set();
const problems = [];

function applyAll(file, text, from, to, label) {
  const n = text.split(from).length - 1;
  if (n === 0) return text;
  const next = text.split(from).join(to);
  if (next.length - text.length !== n * (to.length - from.length)) {
    problems.push(`${label}: unexpected size change in ${file}`);
    return text;
  }
  tally.set(label, (tally.get(label) || 0) + n);
  changedFiles.add(file);
  return next;
}

for (const file of pages) {
  const full = path.join(pub, file);
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  for (const [label, from, to, scope] of RULES) {
    if (scope !== "*" && !scope.includes(file)) continue;
    html = applyAll(file, html, from, to, label);
  }
  if (html !== before) fs.writeFileSync(full, html);
}

// The llms.txt gets a Dallas Alvey entry to match the one Ike already has.
const DALLAS_LLMS =
  `- [Dallas Alvey, MD, DDS](https://713botoxme.com/team-dallas-alvey): ${TX_PROSE}; physician and dentist (MD, UT Southwestern Medical School, 2009; DDS, University of Texas School of Dentistry at Houston, 2015) focused on aesthetic medicine, hormone optimization, peptide therapy and men's health.`;

for (const [label, rel, from, to] of OTHER) {
  const full = path.resolve(rel);
  const text = fs.readFileSync(full, "utf8");
  if (text.includes(to)) { tally.set(label, 0); continue; }
  const next = applyAll(rel, text, from, to, label);
  if (next === text) { problems.push(`${label}: anchor not found in ${rel}`); continue; }
  fs.writeFileSync(full, next);
}

{
  const full = path.resolve("public/llms.txt");
  const text = fs.readFileSync(full, "utf8");
  if (!text.includes("](https://713botoxme.com/team-dallas-alvey):")) {
    const anchor = "- [Ike Nwanonyiri, MD](https://713botoxme.com/team-ike-nwanonyiri):";
    if (text.includes(anchor)) {
      fs.writeFileSync(full, text.replace(anchor, `${DALLAS_LLMS}\n${anchor}`));
      tally.set("llms: Dallas entry added", 1);
      changedFiles.add("llms.txt");
    } else problems.push("llms: Ike anchor not found for Dallas entry");
  }
}

for (const [label, n] of tally) console.log(`${String(n).padStart(4)}  ${label}`);
console.log(`\n${changedFiles.size} file(s) changed`);
if (problems.length) { console.log("\nPROBLEMS:\n  " + problems.join("\n  ")); process.exitCode = 1; }
