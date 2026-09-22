// Builds public/treatment-erectile-dysfunction.html.
//
// Erectile dysfunction was never given its own page. The men's hormone page
// listed "reduced libido or erectile changes" as a symptom and the men's peptide
// page said ED "deserves targeted evaluation" and "standard sexual-health
// treatment" - without ever naming a treatment or saying the practice offers one.
//
// Chrome (head assets, top bar, header, footer, organisation schema) is lifted
// from treatment-hormone-optimization-men.html so it cannot drift from the rest
// of the site, the same way build-results-page.mjs works. The FAQ block and its
// FAQPage JSON-LD are generated from one array, so the visible answers and the
// structured-data answers cannot disagree (see scripts/README.md).
//
// Clinical statements are taken from primary sources only:
//   AUA Erectile Dysfunction Guideline (2018) - statements 1, 3, 4, 8, 10, 12,
//     14-17, 23-25
//   Sildenafil and CIALIS (tadalafil) labeling on DailyMed - dosing,
//     contraindications (nitrates, riociguat), warnings
//   CAVERJECT (alprostadil) labeling on DailyMed - first injections in the
//     provider's office, max 3x weekly with 24h between doses, contraindications,
//     4-hour priapism warning
//   FDA guidance on 503A compounded products that are "essentially copies" of a
//     commercially available drug - a prescriber-documented, patient-specific
//     significant difference; "a lower price" alone does not qualify
//   EAU sexual and reproductive health guideline - a weak recommendation for
//     low-intensity shockwave in mild vasculogenic ED; PRP evidence insufficient
//     to recommend outside clinical trials
//   Cleveland Clinic - the FDA has not approved low-intensity shockwave for ED
//
// The practice offers shockwave and PRP. They are presented as offered, with
// their regulatory status and the guideline positions stated plainly, because a
// claim of benefit a regulator has not supported is exactly what LegitScript's
// transparency standard prohibits. No success rates are quoted.
//
// Medically reviewed by Dallas Alvey, MD, DDS and Ike Nwanonyiri, MD.
//
// LegitScript framing: FDA-approved products are presented first; compounding is
// presented as a prescriber decision for a documented patient-specific need, never
// as a product line or a cheaper alternative, and every compounded product is
// labelled not FDA-approved. No peptide is presented as a treatment for ED,
// because none is approved for it in men.
//
// Idempotent: rewrites the page in full each run.

import fs from "node:fs";
import path from "node:path";

const out = path.resolve("public");
const TEMPLATE = path.join(out, "treatment-hormone-optimization-men.html");
const SLUG = "treatment-erectile-dysfunction";
const URL_ = `https://713botoxme.com/${SLUG}`;
const REVIEWED_ISO = "2026-09-22";
const REVIEWED_TEXT = "September 22, 2026";

const TITLE = "ED Treatment for Men in Houston | Identity Aesthetics";
const DESCRIPTION =
  "ED treatment in Greater Houston and by telehealth: FDA-approved oral options, compounded care when clinically needed, and injection therapy started in-office.";

const tpl = fs.readFileSync(TEMPLATE, "utf8");

// ---- chrome from the template ----------------------------------------------
const between = (s, a, b) => {
  const i = s.indexOf(a);
  const j = s.indexOf(b, i + a.length);
  if (i === -1 || j === -1) throw new Error(`template anchor missing: ${a} … ${b}`);
  return s.slice(i, j);
};
const headAssets = between(tpl, '<link rel="preconnect"', '<script type="application/ld+json">');
const bodyTop = between(tpl, '<div class="topbar">', "<main>") + "<main>";
const footer = tpl.slice(tpl.indexOf("</main>"));
const authoritySchemaRaw = between(tpl, '<script id="identity-authority-schema" type="application/ld+json">', "</script>")
  .replace('<script id="identity-authority-schema" type="application/ld+json">', "");
const authority = JSON.parse(authoritySchemaRaw);
const keep = authority["@graph"].filter((n) => n["@type"] !== "MedicalWebPage");

// ---- helpers ----------------------------------------------------------------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ld = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

// ---- sources ----------------------------------------------------------------
const SOURCES = [
  ["American Urological Association — Erectile Dysfunction Guideline (2018)", "https://www.auanet.org/guidelines-and-quality/guidelines/erectile-dysfunction-(ed)-guideline"],
  ["DailyMed — Sildenafil tablets prescribing information", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b48630b1-5208-4d00-b56f-21701f223758"],
  ["DailyMed — CIALIS (tadalafil) prescribing information", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=bcd8f8ab-81a2-4891-83db-24a0b0e25895"],
  ["DailyMed — CAVERJECT (alprostadil) for intracavernosal injection", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=a295fc1e-d82c-4f44-bc2d-a552bf594c98"],
  ["FDA — Compounded drug products that are essentially copies of a commercially available drug product (Section 503A)", "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/compounded-drug-products-are-essentially-copies-commercially-available-drug-product-under-section"],
  ["European Association of Urology — Management of Erectile Dysfunction", "https://uroweb.org/guidelines/sexual-and-reproductive-health/chapter/management-of-erectile-dysfunction"],
  ["Cleveland Clinic — Shockwave therapy for ED", "https://health.clevelandclinic.org/shockwave-therapy-for-ed"],
];

// ---- FAQ (single source for visible HTML and FAQPage JSON-LD) ----------------
const FAQ = [
  ["Can erectile dysfunction be a sign of heart disease?",
   "It can. The American Urological Association advises that men be counseled that ED is a risk marker for underlying cardiovascular disease and other health conditions. That is why treatment starts with a medical history, examination and selected lab testing rather than a prescription alone."],
  ["Can I take ED medication if I use nitroglycerin or another nitrate?",
   "No. Sildenafil and tadalafil labeling states they are contraindicated with any form of organic nitrate, and with guanylate cyclase stimulators such as riociguat. The combination can cause a dangerous drop in blood pressure. Tell your provider about every medication you take, including ones used only occasionally."],
  ["What is the difference between alprostadil, Bimix and Trimix?",
   "All three are injected into the side of the penis to produce an erection. Alprostadil is available as FDA-approved products such as CAVERJECT and EDEX. Bimix (papaverine and phentolamine) and Trimix (papaverine, phentolamine and alprostadil) are compounded preparations: they are not FDA-approved, and a prescriber chooses them only when a patient-specific clinical reason supports it."],
  ["Why does injection therapy start in the office?",
   "The AUA guideline says an in-office injection test should be performed for men considering injection therapy, and alprostadil labeling directs that the first injections be given in the provider's office. The test visit sets a safe starting dose, teaches technique and checks for a prolonged erection before you inject at home."],
  ["Can I get ED treatment by telehealth?",
   "Oral medication may be prescribed through a telehealth visit for patients physically located in Texas, North Carolina or South Carolina, after an evaluation and when clinically appropriate. Injection therapy begins with an in-office visit. Labs or an in-person examination may be required."],
  ["Does low testosterone cause ED?",
   "Sometimes it contributes, but ED has many causes, including blood-vessel, nerve, medication, psychological and relationship factors. The AUA recommends measuring morning total testosterone in men with ED, and notes that for men with confirmed testosterone deficiency, oral ED medication may work better when the deficiency is also treated."],
  ["Do shockwave therapy and PRP work for ED?",
   "Both are offered here, and both are still being studied. Neither is FDA-approved to treat ED. The AUA considers low-intensity shockwave investigational and PRP experimental. European urology guidelines give shockwave a weak recommendation for men with mild blood-flow-related ED, and say the evidence for PRP is not yet enough to recommend it. We explain this before you decide, and we do not promise results."],
  ["Is compounded ED medication FDA-approved?",
   "No. Compounded drugs are not FDA-approved and are not reviewed by the FDA for safety, effectiveness or quality. FDA guidance also states that a lower price on its own does not justify compounding a copy of a commercially available drug; the prescriber must identify a specific difference that matters for that patient."],
];

// ---- page body --------------------------------------------------------------
const hero = `<section class="hero"><div class="wrap"><p class="crumb"><a href="/">Home</a> / <a href="treatments">Treatment Library</a> / Erectile Dysfunction Treatment</p><div class="hero-grid"><div><span class="eyebrow">Men’s health</span><h1>Erectile Dysfunction Treatment for Men</h1><p class="lead">A private, physician-supervised evaluation that looks for the cause first, then walks you through every option that is safe for you: oral medication, compounded preparations when there is a clinical reason, injection therapy, and regenerative therapies.</p><div class="cta"><a class="btn btn-gold" href="book-consultation?service=Erectile%20Dysfunction%20Treatment">Book a Private Consultation</a><a class="btn btn-line" href="telehealth">Explore Telehealth</a></div><div class="review-chip">Evidence reviewed ${REVIEWED_TEXT}</div></div><dl class="quick"><div><b>Oral options</b><span>In-office or eligible telehealth</span></div><div><b>Injection therapy</b><span>Starts with an in-office test dose</span></div><div><b>Pricing</b><span>Consultation required</span></div></dl></div></div></section>`;

const editorial = `<section class="treatment-editorial" aria-label="Men’s health"><img src="images/editorial/mens-wellness-editorial.webp" alt="Mature man in a calm, private clinical setting" loading="eager" decoding="async" width="1799" height="874"><div class="treatment-editorial-shade" aria-hidden="true"></div><div class="wrap treatment-editorial-inner"><div class="treatment-editorial-copy"><span class="eyebrow">Discreet, physician-led care</span><h2>ED is often a health signal, not only a symptom</h2><p>Erections depend on blood vessels, nerves, hormones and mood working together. A good evaluation treats the symptom and checks what it may be telling you.</p></div></div></section>`;

const answer = `<section><div class="wrap answer"><div><span class="eyebrow">The short answer</span><h2>What is erectile dysfunction treatment?</h2><p>Erectile dysfunction (ED) is a persistent difficulty getting or keeping an erection firm enough for satisfying sex. Treatment begins with an evaluation, because ED can be an early marker of cardiovascular disease, diabetes or hormone problems. From there, the first-line option for most men is an FDA-approved oral PDE-5 inhibitor such as sildenafil or tadalafil. Men who cannot take or do not respond to tablets may be offered injection therapy with FDA-approved alprostadil or compounded Bimix or Trimix, started with a supervised in-office test dose. We also offer low-intensity shockwave therapy and platelet-rich plasma (PRP); neither is FDA-approved for ED, and both are explained plainly below.</p></div><div class="answer-card"><h3>Concerns we evaluate</h3><ul><li>Difficulty getting or keeping an erection</li><li>Tablets that stopped working or never worked well</li><li>Side effects from a current ED medication</li><li>ED alongside low energy, low libido, weight gain or poor sleep</li><li>ED after prostate treatment or with diabetes</li></ul></div></div></section>`;

const options = `<section class="alt"><div class="wrap"><div class="section-head"><span class="eyebrow">Treatment options</span><h2>How the options compare</h2><p>The AUA guideline asks that men be told about every treatment that is not medically unsafe for them, so the decision is shared. This is the menu we discuss.</p></div><div class="comparison-wrap"><table class="comparison"><thead><tr><th>Decision point</th><th>Oral PDE-5 inhibitors</th><th>Compounded formulations</th><th>Injection therapy</th></tr></thead><tbody>`
  + `<tr><td>What it is</td><td>Tablets such as sildenafil or tadalafil that enhance the body’s natural erection response to arousal</td><td>A preparation made by a licensed pharmacy for one patient, such as a different dosage form or a strength not commercially available</td><td>Medication injected with a very fine needle into the side of the penis: alprostadil, or compounded Bimix or Trimix</td></tr>`
  + `<tr><td>FDA status</td><td>FDA-approved for ED; tadalafil is also approved for benign prostatic hyperplasia</td><td>Not FDA-approved; not reviewed by the FDA for safety, effectiveness or quality</td><td>Alprostadil (CAVERJECT, EDEX) is FDA-approved. Bimix and Trimix are compounded and not FDA-approved</td></tr>`
  + `<tr><td>How it starts</td><td>Evaluation, then a starting dose that is adjusted to find the best balance of effect and side effects</td><td>Only when a prescriber documents a patient-specific reason an approved product will not work as well</td><td>An in-office test injection to set a safe dose and teach technique before any home use</td></tr>`
  + `<tr><td>Timing</td><td>Sildenafil is usually taken about 1 hour before sex. Tadalafil can work for up to 36 hours, or can be taken daily</td><td>Depends on the preparation prescribed</td><td>Works directly, without needing arousal to start; alprostadil labeling limits use to 3 times a week with 24 hours between doses</td></tr>`
  + `<tr><td>Key caution</td><td>Never with nitrates or riociguat; care with alpha-blockers and blood-pressure medicines</td><td>Quality depends on the pharmacy, which is why we verify ours</td><td>An erection lasting more than 4 hours is a medical emergency</td></tr>`
  + `</tbody></table></div></div></section>`;

const regenerative = `<section><div class="wrap"><div class="section-head"><span class="eyebrow">Regenerative options</span><h2>Shockwave therapy and PRP</h2><p>We offer both. They differ from the treatments above in one way you should know before choosing: neither is FDA-approved to treat ED, and the evidence is still developing. We would rather you hear that from us.</p></div><div class="grid g2"><article class="card"><h3>Low-intensity shockwave therapy</h3><p>Low-energy acoustic waves are applied to the penis over a series of short sessions, with the aim of improving blood flow. No anesthesia is needed and there is no downtime.</p><p style="margin-top:12px"><strong>Where the evidence stands:</strong> the FDA has not approved shockwave for ED. The AUA guideline considers it investigational. European urology guidelines give it a weak recommendation for men with mild blood-flow-related ED, men who prefer not to take or cannot take tablets, and men who respond poorly to them.</p></article><article class="card"><h3>Platelet-rich plasma (PRP)</h3><p>A small sample of your own blood is processed to concentrate platelets, which are then injected into the penis after numbing.</p><p style="margin-top:12px"><strong>Where the evidence stands:</strong> PRP is not FDA-approved for ED. The AUA guideline considers it experimental, and European urology guidelines say current evidence is not yet enough to recommend it and that larger trials are needed. Some studies show modest improvement; results are not guaranteed.</p></article></div><p class="editorial" style="margin-top:24px">Neither therapy replaces a medical evaluation, and we do not quote success rates. If one is appropriate, your provider explains what is known, what is not, and how it compares with FDA-approved options before you consent.</p></div></section>`;

const candidacy = `<section><div class="wrap"><div class="section-head"><span class="eyebrow">Candidacy</span><h2>Who may—or may not—be a candidate</h2></div><div class="grid g2"><article class="card"><h3>Who may be considered</h3><p>Adult men with ongoing erection difficulties who complete a medical, sexual and psychosocial history and a focused examination, with selected lab testing. Cardiovascular fitness for sexual activity is considered first, because sex is physical exertion. Men whose tablets have not worked are often good candidates for a second look: the AUA guideline recommends titrating the dose and giving clear instructions before concluding a tablet has failed.</p></article><article class="card caution"><h3>When treatment may not be appropriate</h3><p>Oral PDE-5 inhibitors must not be used with any nitrate medicine (such as nitroglycerin) or with riociguat. Recent heart attack or stroke, unstable heart disease or very low blood pressure need cardiology input first. Injection therapy is contraindicated in men predisposed to priapism—such as sickle cell disease or trait, multiple myeloma or leukemia—in men with penile fibrosis or a penile implant, and needs extra care with blood thinners.</p></article></div></div></section>`;

const facts = `<section class="alt"><div class="wrap"><div class="section-head"><span class="eyebrow">At a glance</span><h2>Treatment facts</h2><p>These are practical planning ranges, not promises. Your consultation determines the exact plan.</p></div><dl class="facts"><div class="fact"><dt>Consultation</dt><dd>About 30–45 minutes; labs are separate</dd></div><div class="fact"><dt>Comfort</dt><dd>No anesthesia. Injections use a very fine needle; most men describe a brief pinch</dd></div><div class="fact"><dt>Downtime</dt><dd>None</dd></div><div class="fact"><dt>When it works</dt><dd>Sildenafil about 1 hour after a dose; tadalafil up to 36 hours; injections within minutes</dd></div><div class="fact"><dt>How long results last</dt><dd>Each dose is temporary; treatment is ongoing while it remains safe and helpful</dd></div><div class="fact"><dt>Follow-up</dt><dd>Dose adjustment visits; injection patients are reviewed after the test dose</dd></div></dl></div></section>`;

const steps = `<section><div class="wrap"><div class="section-head"><span class="eyebrow">Your visit</span><h2>What happens during treatment</h2></div><div class="grid g3 steps"><div class="step"><h3>Find the cause</h3><p>A provider reviews your history, every medication, cardiovascular risk, sleep and mood, and orders selected labs—including a morning total testosterone, as the AUA recommends.</p></div><div class="step"><h3>Choose together</h3><p>Every option that is safe for you is explained with its benefits and burdens. FDA-approved treatment is the starting point; compounding is used only when there is a documented reason.</p></div><div class="step"><h3>Start and adjust</h3><p>Tablets begin at a standard dose and are adjusted. Injection therapy begins in the office with a test dose and hands-on teaching, followed by a review before home use.</p></div></div></div></section>`;

const risks = `<section class="alt"><div class="wrap"><div class="section-head"><span class="eyebrow">Informed choice</span><h2>Important risks, limitations and alternatives</h2></div><div class="grid g2"><article class="card caution"><h3>Risks &amp; limitations</h3><p>PDE-5 inhibitor labeling warns about low blood pressure with alpha-blockers or other blood-pressure medicines, prolonged erection, sudden vision loss (NAION) and sudden hearing loss; stop and seek care for any sudden change in vision or hearing. Injection therapy can cause bruising, pain and, with repeated use, penile scarring or curvature. With any treatment, an erection lasting more than 4 hours is priapism and needs emergency care. No treatment cures the underlying cause, and results vary.</p></article><article class="card"><h3>Alternatives to discuss</h3><ul><li>Treating contributors: blood pressure, diabetes, weight, sleep apnea, smoking, alcohol and medication effects</li><li>Counseling or sex therapy, alone or with medication</li><li>Vacuum erection devices</li><li>Urology referral for intraurethral alprostadil or a penile implant</li><li>Low-intensity shockwave therapy or PRP, described below, which are not FDA-approved for ED</li></ul></article></div></div></section>`;

const compounding = `<section><div class="wrap answer"><div><span class="eyebrow">Medication transparency</span><h2>How we use compounded medication</h2><p>FDA-approved products come first. A compounded preparation is considered only when a prescriber determines that a specific difference is clinically necessary for you—for example a dosage form you can use, a strength that is not commercially available, or a combination injection such as Bimix or Trimix after an approved option has not worked.</p><p>Compounded drugs are not FDA-approved. FDA guidance is explicit that a lower price on its own does not justify compounding a copy of a commercially available drug, and that the prescriber must document the patient-specific reason.</p></div><div class="answer-card"><h3>What that means for you</h3><ul><li>You are told when a medicine is compounded</li><li>The clinical reason is recorded on your prescription</li><li>The dispensing pharmacy and its license status are verified</li><li>Compounded products are never described as FDA-approved or equivalent</li></ul><p><a class="btn btn-line" href="pharmacy-sourcing">Review Pharmacy Sourcing</a></p></div></div></section>`;

const connected = `<section class="alt"><div class="wrap"><div class="section-head"><span class="eyebrow">Men’s health, connected</span><h2>How ED connects to hormones, weight and peptide care</h2><p>ED shares risk factors with conditions our men’s programs already evaluate, so one visit can look at the whole picture instead of a single prescription.</p></div><div class="grid g2"><article class="card"><h3>Hormones</h3><p>The AUA recommends measuring morning testosterone in men with ED. For men with confirmed testosterone deficiency, oral ED medication may be more effective when the deficiency is treated as well. Symptoms alone do not diagnose low testosterone.</p><p><a href="treatment-hormone-optimization-men">Hormone Optimization for Men →</a></p></article><article class="card"><h3>Weight, sleep and metabolic health</h3><p>Obesity, diabetes, sleep apnea and cardiovascular disease are all linked to ED. Our physician-managed men’s program evaluates these together. To be clear: no peptide is FDA-approved to treat ED in men, and we do not present one as an ED treatment.</p><p><a href="peptide-program-men">Peptide Program for Men →</a></p></article></div></div></section>`;

const access = `<section><div class="wrap"><div class="setting"><div><span class="eyebrow">Access &amp; cost</span><h2>In-office versus telehealth</h2><p>Consultations and oral medication may be available by telehealth for patients physically located in Texas, North Carolina or South Carolina, subject to law and clinical appropriateness. Labs or an in-person examination may be required. Injection therapy starts with an in-office visit at any of our locations.</p><p><strong>Pricing:</strong> Consultation required. Cost depends on evaluation, laboratory testing, the medication prescribed, pharmacy and insurance coverage.</p></div><div class="cta"><a class="btn btn-gold" href="book-consultation?service=Erectile%20Dysfunction%20Treatment">Book a Private Consultation</a><a class="btn btn-line" href="telehealth">Telehealth Details</a></div></div></div></section>`;

const faqHtml = `<section class="alt"><div class="wrap faq"><div class="section-head"><span class="eyebrow">Common questions</span><h2>Erectile Dysfunction Treatment FAQ</h2></div>${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a">${esc(a)}</div></details>`).join("")}</div></section>`;

const sourcesHtml = `<section><div class="wrap"><div class="sources"><h2>Sources &amp; medical review</h2><ol>${SOURCES.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("")}</ol><p class="editorial"><strong>Medical-content evidence review:</strong> ${REVIEWED_TEXT}. Content is written for patient education and structured from current primary regulatory, labeling and professional sources. It has not been individualized to your medical history. Product labeling and guidance can change; a licensed Identity Aesthetics provider confirms current suitability, informed consent and treatment details before care.</p></div></div></section>`;

const band = `<section class="band"><div class="wrap"><span class="eyebrow">Your next step</span><h2>A private, informed plan</h2><p>Bring your medication list—including anything you take only occasionally—and your questions. We will help you decide which option, if any, fits your health and goals.</p><div class="cta"><a class="btn btn-gold" href="book-consultation?service=Erectile%20Dysfunction%20Treatment">Book a Private Consultation</a><a class="btn btn-line" href="tel:713-268-6963">Call 713-BOTOX-ME</a></div></div></section>`;

const pathways = `<section class="authority-pathways" aria-labelledby="authority-pathways-title"><div class="wrap"><div class="authority-heading"><span class="eyebrow">Continue Exploring</span><h2 id="authority-pathways-title">Move from information to the right next step.</h2><p>Explore connected men’s health guidance, meet the clinical team or begin a private consultation.</p></div><div class="authority-link-grid"><a class="authority-link" href="treatment-hormone-optimization-men"><span>Men’s health</span><strong>Hormone optimization for men</strong></a><a class="authority-link" href="peptide-program-men"><span>Men’s health</span><strong>Peptide program for men</strong></a><a class="authority-link" href="telehealth"><span>Care from home</span><strong>Telehealth in TX, NC &amp; SC</strong></a><a class="authority-link" href="book-consultation?service=Erectile%20Dysfunction%20Treatment"><span>Next step</span><strong>Book a consultation</strong></a></div></div></section>`;

const review = `<section class="authority-review" aria-label="Editorial and medical review information"><div class="wrap"><div class="authority-review-card"><div class="authority-review-item"><span class="authority-review-label">Prepared by</span><a href="editorial-policy">Identity Aesthetics Clinical Editorial Team</a><p>Patient education developed from primary regulatory, labeling and professional sources.</p></div><div class="authority-review-item"><span class="authority-review-label">Medically reviewed by</span><a href="team-dallas-alvey">Dallas Alvey, MD, DDS</a> and <a href="team-ike-nwanonyiri">Ike Nwanonyiri, MD</a><p>Physician review across hormone optimization, men’s health and regenerative medicine.</p></div><div class="authority-review-item"><span class="authority-review-label">Evidence review</span><strong>${REVIEWED_TEXT}</strong><p><a href="editorial-policy">Read our editorial standards and update policy</a></p></div></div></div></section>`;

// ---- structured data --------------------------------------------------------
const pageSchema = [
  {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Erectile Dysfunction Treatment Guide | Identity Aesthetics",
    url: URL_,
    description: DESCRIPTION,
    dateModified: REVIEWED_ISO,
    audience: { "@type": "Patient" },
    about: {
      "@type": "MedicalCondition",
      name: "Erectile dysfunction",
      alternateName: "ED",
      riskFactor: [
        { "@type": "MedicalRiskFactor", name: "Cardiovascular disease" },
        { "@type": "MedicalRiskFactor", name: "Diabetes" },
        { "@type": "MedicalRiskFactor", name: "Obesity" },
        { "@type": "MedicalRiskFactor", name: "Testosterone deficiency" },
      ],
      possibleTreatment: [
        { "@type": "Drug", name: "Sildenafil", drugClass: { "@type": "DrugClass", name: "Phosphodiesterase type 5 inhibitor" }, isProprietary: false, prescriptionStatus: "https://schema.org/PrescriptionOnly" },
        { "@type": "Drug", name: "Tadalafil", drugClass: { "@type": "DrugClass", name: "Phosphodiesterase type 5 inhibitor" }, isProprietary: false, prescriptionStatus: "https://schema.org/PrescriptionOnly" },
        { "@type": "Drug", name: "Alprostadil", administrationRoute: "Intracavernosal", prescriptionStatus: "https://schema.org/PrescriptionOnly" },
        { "@type": "MedicalTherapy", name: "Compounded intracavernosal injection therapy (Bimix or Trimix)", description: "Compounded preparations; not FDA-approved. Prescribed only for a documented patient-specific clinical need." },
        { "@type": "MedicalTherapy", name: "Low-intensity shockwave therapy", description: "Not FDA-approved for erectile dysfunction; considered investigational by the AUA." },
        { "@type": "MedicalTherapy", name: "Platelet-rich plasma (PRP) injection", description: "Not FDA-approved for erectile dysfunction; considered experimental by the AUA." },
      ],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://713botoxme.com/" },
      { "@type": "ListItem", position: 2, name: "Treatment Library", item: "https://713botoxme.com/treatments" },
      { "@type": "ListItem", position: 3, name: "Erectile Dysfunction Treatment", item: URL_ },
    ],
  },
];

const authorityGraph = {
  "@context": "https://schema.org",
  "@graph": [
    ...keep,
    {
      "@type": "Person",
      "@id": "https://713botoxme.com/team-ike-nwanonyiri#person",
      name: "Ike Nwanonyiri, MD",
      honorificSuffix: "MD",
      jobTitle: "Chief Medical Officer",
      url: "https://713botoxme.com/team-ike-nwanonyiri",
      worksFor: { "@id": "https://713botoxme.com/#organization" },
      knowsAbout: ["Family medicine", "Men's health", "Regenerative medicine", "Sports medicine"],
    },
    {
      "@type": "MedicalWebPage",
      "@id": `${URL_}#webpage`,
      url: URL_,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { "@id": "https://713botoxme.com/#website" },
      publisher: { "@id": "https://713botoxme.com/#organization" },
      dateModified: REVIEWED_ISO,
      author: { "@id": "https://713botoxme.com/editorial-policy#editorial-team" },
      reviewedBy: [{ "@id": "https://713botoxme.com/team-dallas-alvey#person" }, { "@id": "https://713botoxme.com/team-ike-nwanonyiri#person" }],
      lastReviewed: REVIEWED_ISO,
    },
  ],
};

// ---- assemble ---------------------------------------------------------------
const head = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(DESCRIPTION)}">
<link rel="canonical" href="${URL_}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Identity Aesthetics">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(TITLE)}">
<meta property="og:description" content="${esc(DESCRIPTION)}">
<meta property="og:url" content="${URL_}">
<meta property="og:image" content="https://713botoxme.com/images/og/home-og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Identity Aesthetics">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(TITLE)}">
<meta name="twitter:description" content="${esc(DESCRIPTION)}">
<meta name="twitter:image" content="https://713botoxme.com/images/og/home-og.jpg">
${headAssets}<script type="application/ld+json">${ld(pageSchema)}</script><link rel="stylesheet" href="authority-signals.css?v=71"><script id="identity-authority-schema" type="application/ld+json">${ld(authorityGraph)}</script></head><body>
`;

const html =
  head +
  bodyTop +
  "\n" +
  [hero, editorial, answer, options, regenerative, candidacy, facts, steps, risks, compounding, connected, access, faqHtml, sourcesHtml, band + pathways + review].join("\n") +
  footer;

fs.writeFileSync(path.join(out, `${SLUG}.html`), html);
console.log(`wrote public/${SLUG}.html (${html.length} bytes, ${FAQ.length} FAQs, ${SOURCES.length} sources)`);
