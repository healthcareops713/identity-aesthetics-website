import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("routes the site root to the imported Identity Aesthetics homepage", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "http://localhost/index.html");
});

test("removes RHA Collection references from the complete site", async () => {
  const publicDirectory = new URL("../public/", import.meta.url);
  const publicFiles = await readdir(publicDirectory);
  const htmlFiles = publicFiles.filter((file) => file.endsWith(".html"));
  const combinedHtml = (
    await Promise.all(
      htmlFiles.map((file) => readFile(new URL(file, publicDirectory), "utf8")),
    )
  ).join("\n");

  assert.doesNotMatch(combinedHtml, /\bRHA\b/i);
  assert.match(combinedHtml, /Radiesse(?:®)? or Sculptra(?:®)? \(Biostimulators\)/);
});

test("injects the approved Ageless embed launcher into every HTML response", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("ageless-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(new Request("http://localhost/index.html", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("<html><body><main>Example</main></body></html>", { headers: { "content-type": "text/html" } }) } }, { waitUntil() {}, passThroughOnException() {} });
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.equal((html.match(/<ageless-embed-launcher/g) ?? []).length, 1);
  assert.match(html, /embed\/platforms\/9e964276-ce08-4944-b3d8-4b84eca026ea\/a\/713botoxme\/transformation/);
  assert.match(html, /data-ageless-mode="floating"/);
  assert.match(html, /data-ageless-color="#805716"/);
  assert.match(html, /https:\/\/www\.ageless\.ai\/embed\/v1\/loader\.js/);
  assert.doesNotMatch(html, /ageless-direct-launcher/);
});

test("promotes telehealth consistently across every public page", async () => {
  const pages = [
    "index.html",
    "injectables.html",
    "medspa.html",
    "weight-loss.html",
    "peptides.html",
    "peptide-education.html",
    "locations.html",
    "about.html",
    "team.html",
    "contact.html",
    "telehealth.html",
    "payment-plans.html",
    "glo2facial-treatments.html",
    "virtual-preview.html",
    "faq.html",
    "peptide-approved.html",
    "peptide-research.html",
    "peptide-safety.html",
  ];

  for (const page of pages) {
    const html = await readFile(new URL(`../public/${page}`, import.meta.url), "utf8");
    assert.match(html, /href="telehealth\.html"/, `${page} should link to telehealth`);
    assert.match(html, /Book a Telehealth Visit/, `${page} should show the telehealth call to action`);
  }
});

test("provides a persistent English and Spanish selector across every patient page", async () => {
  const pages = await readdir(new URL("../public/", import.meta.url));
  for (const page of pages.filter((name) => name.endsWith(".html"))) {
    const html = await readFile(new URL(`../public/${page}`, import.meta.url), "utf8");
    assert.match(html, /href="language-toggle\.css"/, `${page} should load the bilingual control styles`);
    assert.match(html, /src="language-toggle\.js"/, `${page} should load the bilingual control`);
  }
  const script = await readFile(new URL("../public/language-toggle.js", import.meta.url), "utf8");
  assert.match(script, /Language \/ Idioma/);
  assert.match(script, /includedLanguages:"en,es"/);
  assert.match(script, /identity-language/);
  assert.match(script, /Traducción automática para su comodidad/);
});

test("publishes functional legal, offers and treatment-resource pages", async () => {
  const privacy = await readFile(new URL("../public/privacy.html", import.meta.url), "utf8");
  const terms = await readFile(new URL("../public/terms.html", import.meta.url), "utf8");
  const accessibility = await readFile(new URL("../public/accessibility.html", import.meta.url), "utf8");
  const offers = await readFile(new URL("../public/memberships-offers.html", import.meta.url), "utf8");
  const guides = await readFile(new URL("../public/treatment-guides.html", import.meta.url), "utf8");
  const home = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

  assert.match(privacy, /Fresha.*Cherry.*Ageless AI.*Google Translate/s);
  assert.match(privacy, /This website policy is not a Notice of Privacy Practices/);
  assert.match(terms, /does not create a provider-patient relationship/);
  assert.match(accessibility, /accessible alternative/);
  assert.match(offers, /not guaranteed discounts/);
  assert.match(offers, /may change or end without notice/);
  assert.match(guides, /Do not stop anticoagulants, aspirin or any prescribed medicine/);
  assert.match(guides, /skin becoming white, gray or blue/);
  assert.match(guides, /No tightening, sexual-function or urinary outcome can be guaranteed/);
  assert.match(home, /href="memberships-offers\.html"/);
  assert.match(home, /href="treatment-guides\.html"/);
  for (const slug of ["privacy", "terms", "accessibility", "memberships-offers", "treatment-guides"]) {
    assert.match(sitemap, new RegExp(`${slug}\\.html`));
  }
});

test("adds a responsive three-action booking bar to every patient page", async () => {
  const pages = await readdir(new URL("../public/", import.meta.url));
  for (const page of pages.filter((name) => name.endsWith(".html"))) {
    const html = await readFile(new URL(`../public/${page}`, import.meta.url), "utf8");
    assert.match(html, /href="site-enhancements\.css"/, `${page} should load mobile action styles`);
    assert.match(html, /src="site-enhancements\.js"/, `${page} should load mobile actions`);
  }
  const script = await readFile(new URL("../public/site-enhancements.js", import.meta.url), "utf8");
  assert.match(script, /Call \/ Text/);
  assert.match(script, />Telehealth</);
  assert.match(script, />Book Now</);
});

test("keeps the Identity Aesthetics sparkle animation visible and cache-current", async () => {
  const sparkle = await readFile(new URL("../public/images/identity-aesthetics-sparkles.svg", import.meta.url), "utf8");
  const script = await readFile(new URL("../public/site-enhancements.js", import.meta.url), "utf8");
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(sparkle, /@keyframes iaTwinkleOne/);
  assert.match(sparkle, /@keyframes iaTwinkleTwo/);
  assert.match(sparkle, /class="twinkle twinkle-one"/);
  assert.match(sparkle, /class="twinkle twinkle-two"/);
  assert.doesNotMatch(sparkle, /<animate(?:Transform)?\b/);
  assert.match(script, /identity-aesthetics-sparkles\.svg\?v=98/);
  assert.match(worker, /site-enhancements\.js\?v=98/);
});

test("publishes a crawlable, evidence-separated peptide education hub", async () => {
  const hub = await readFile(new URL("../public/peptide-education.html", import.meta.url), "utf8");
  const approved = await readFile(new URL("../public/peptide-approved.html", import.meta.url), "utf8");
  const research = await readFile(new URL("../public/peptide-research.html", import.meta.url), "utf8");
  const safety = await readFile(new URL("../public/peptide-safety.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");

  assert.match(hub, /FDA-approved/);
  assert.match(hub, /Research-only/);
  assert.match(hub, /MedicalWebPage/);
  assert.match(hub, /Five labels that change/);
  assert.match(hub, /Ten questions to ask/);
  assert.match(hub, /"@type":"FAQPage"/);
  assert.doesNotMatch(hub, /250 mcg|2 mg daily|target IGF-1|synergistic protocol/i);
  assert.match(approved, /Why this directory defines its scope/);
  assert.match(approved, /Semaglutide 2\.4 mg · STEP 1/);
  assert.match(research, /BPC-157/);
  assert.match(research, /TB-500/);
  assert.match(research, /Retatrutide/);
  assert.match(research, /No dosing or self-injection instructions/);
  assert.match(safety, /503A and 503B are/);
  assert.match(safety, /What LegitScript can/);
  assert.match(safety, /FDA MedWatch/);
  assert.match(sitemap, /peptide-approved\.html/);
  assert.match(sitemap, /peptide-education\.html/);
  assert.match(sitemap, /peptide-research\.html/);
  assert.match(sitemap, /peptide-safety\.html/);
  assert.match(robots, /Sitemap:/);
  assert.match(llms, /Peptide Education Center/);
});

test("separates patient peptide consultations from the evidence hub without unsupported promises", async () => {
  const service = await readFile(new URL("../public/peptides.html", import.meta.url), "utf8");
  const hub = await readFile(new URL("../public/peptide-education.html", import.meta.url), "utf8");
  assert.match(service, /Are you feeling/);
  assert.match(service, /Schedule an In-Office Consultation/);
  assert.match(service, /Schedule a Telehealth Consultation/);
  assert.match(service, /do not necessarily mean peptide therapy is appropriate/);
  assert.match(service, /href="peptide-education\.html"/);
  assert.doesNotMatch(hub, /strong safety profile/);
  assert.doesNotMatch(hub, /promotes steady, natural growth hormone release/);
  assert.doesNotMatch(hub, /deeper sleep, improved recovery, leaner body composition/);
});

test("publishes indexable individual evidence guides for high-interest peptides", async () => {
  const slugs = [
    "semaglutide",
    "tirzepatide",
    "retatrutide",
    "bpc-157",
    "tb-500",
    "cjc-1295",
    "ipamorelin",
    "sermorelin",
  ];
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

  for (const slug of slugs) {
    const html = await readFile(new URL(`../public/peptide-${slug}.html`, import.meta.url), "utf8");
    assert.match(html, /MedicalWebPage/);
    assert.match(html, /Evidence Before Treatment/);
    assert.match(html, /Source review date:/);
    assert.match(sitemap, new RegExp(`peptide-${slug}\\.html`));
  }
});

test("telehealth page states service area and in-person boundaries", async () => {
  const html = await readFile(new URL("../public/telehealth.html", import.meta.url), "utf8");
  assert.match(html, /Texas/);
  assert.match(html, /North Carolina/);
  assert.match(html, /South Carolina/);
  assert.match(html, /Injectables, laser procedures, facials and body-contouring treatments still require an appointment/);
});

test("presents the HIFU vaginal wellness service without guaranteed outcomes", async () => {
  const html = await readFile(new URL("../public/medspa.html", import.meta.url), "utf8");
  assert.match(html, /Vaginal Rejuvenation/);
  assert.match(html, /gentle HIFU \(focused ultrasound\) technology/);
  assert.match(html, /realistic expectations, risks and alternative treatments/);
  assert.doesNotMatch(html, /IPL Photofacial/);
  assert.doesNotMatch(html, /mind boggling/i);
  assert.doesNotMatch(html, /guarantee/i);
});

test("publishes the configured Cherry payment plans experience", async () => {
  const html = await readFile(new URL("../public/payment-plans.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  assert.match(html, /https:\/\/files\.withcherry\.com\/widgets\/widget\.js/);
  assert.match(html, /slug: 'identityaesthetics'/);
  assert.match(html, /name: "Identity Aesthetics"/);
  assert.match(html, /images: \[44\]/);
  assert.match(html, /defaultPurchaseAmount: 750/);
  assert.match(html, /imageCategory: 'aesthetics'/);
  assert.match(html, /primaryColor: '#615d3f'/);
  assert.match(html, /secondaryColor: '#615d3f10'/);
  assert.match(html, /fontFamily: 'Raleway'/);
  assert.match(html, /headerFontFamily: 'Raleway'/);
  assert.match(html, /<div id="all"><\/div>/);
  assert.match(html, /<div id="hero"><\/div>/);
  assert.match(html, /<div id="calculator"><\/div>/);
  assert.match(html, /<div id="howitworks"><\/div>/);
  assert.match(html, /<div id="testimony"><\/div>/);
  assert.match(html, /<div id="faq"><\/div>/);
  assert.match(html, /href="#calculator"[^>]*>Fast application<\/a>/);
  assert.match(html, /href="#calculator"[^>]*>Flexible payment options<\/a>/);
  assert.match(html, /href="#howitworks"[^>]*>Powered by Cherry<\/a>/);
  assert.doesNotMatch(html, /<span>Fast application<\/span>/);
  assert.match(html, /url\('images\/payment-plans-hero\.webp'\)/);
  assert.match(sitemap, /payment-plans\.html/);
});

test("shows peptide education and payment plans in the homepage menu", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const desktopNav = html.match(/<nav class="links">([\s\S]*?)<\/nav>/)?.[1] ?? "";
  const mobileNav = html.match(/<div class="m-nav" id="mnav">([\s\S]*?)<\/div>/)?.[1] ?? "";
  assert.match(desktopNav, /href="peptide-education\.html">Peptide Ed<\/a>/);
  assert.match(desktopNav, /href="payment-plans\.html">Payment Plans<\/a>/);
  assert.match(mobileNav, /href="peptide-education\.html">Peptide Ed<\/a>/);
  assert.match(mobileNav, /href="payment-plans\.html">Payment Plans<\/a>/);
});

test("uses the homepage menu links and order on every page", async () => {
  const pages = [
    "index.html", "injectables.html", "medspa.html", "weight-loss.html",
    "peptides.html", "peptide-education.html", "payment-plans.html",
    "locations.html", "about.html", "team.html", "contact.html", "telehealth.html",
    "faq.html",
    "peptide-approved.html", "peptide-research.html", "peptide-safety.html",
    "peptide-semaglutide.html", "peptide-tirzepatide.html",
    "peptide-retatrutide.html", "peptide-bpc-157.html",
    "peptide-tb-500.html", "peptide-cjc-1295.html",
    "peptide-ipamorelin.html", "peptide-sermorelin.html",
    "glo2facial-treatments.html",
    "virtual-preview.html",
  ];
  const expectedOrder = [
    "injectables.html", "medspa.html", "weight-loss.html", "peptides.html",
    "peptide-education.html", "payment-plans.html", "locations.html",
    "about.html", "team.html", "faq.html", "contact.html",
  ];

  for (const page of pages) {
    const html = await readFile(new URL(`../public/${page}`, import.meta.url), "utf8");
    const desktopNav = html.match(/<nav class="links">([\s\S]*?)<\/nav>/)?.[1] ?? "";
    const mobileNav = html.match(/<div class="m-nav" id="mnav">([\s\S]*?)<\/div>/)?.[1] ?? "";
    for (const nav of [desktopNav, mobileNav]) {
      let previousIndex = -1;
      for (const href of expectedOrder) {
        const currentIndex = nav.indexOf(`href="${href}"`);
        assert.ok(currentIndex > previousIndex, `${page} should include ${href} in homepage menu order`);
        previousIndex = currentIndex;
      }
    }
    assert.match(html, /Book a Telehealth Visit/);
    assert.match(html, />Book Now</);
  }
});

test("publishes the Meet the Team page with provider-specific booking options", async () => {
  const html = await readFile(new URL("../public/team.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

  for (const provider of ["ike", "dallas", "sarah"]) {
    const card = html.match(new RegExp(`<article class="team-card" data-person="${provider}">([\\s\\S]*?)</article>`))?.[1] ?? "";
    assert.match(card, /Book Telehealth/, `${provider} should offer telehealth booking`);
    assert.match(card, /Book In-Office/, `${provider} should offer in-office booking`);
  }

  for (const provider of ["astrid", "patricia"]) {
    const card = html.match(new RegExp(`<article class="team-card" data-person="${provider}">([\\s\\S]*?)</article>`))?.[1] ?? "";
    assert.match(card, /In-Office Only/, `${provider} should be marked in-office only`);
    assert.match(card, /Book In-Office/, `${provider} should offer in-office booking`);
    assert.doesNotMatch(card, /Book Telehealth/, `${provider} should not offer telehealth booking`);
  }

  assert.equal((html.match(/>View Full Bio</g) ?? []).length, 10);
  const desktopNav = html.match(/<nav class="links">([\s\S]*?)<\/nav>/)?.[1] ?? "";
  assert.equal((desktopNav.match(/href="team\.html"/g) ?? []).length, 1);
  assert.ok(
    html.indexOf('<article class="team-card" data-person="ike"') < html.indexOf('<article class="team-card" data-person="dallas"'),
    "Ike and Dallas should lead the page together",
  );
  assert.ok(
    html.indexOf('<article class="team-card" data-person="dameon"') > html.indexOf('<article class="team-card" data-person="samantha"'),
    "Dameon and Executive Leadership should appear after the team sections",
  );
  assert.match(html, /Medical Leadership/);
  assert.match(html, /Executive Leadership/);
  assert.match(html, /Business Development/);
  assert.match(html, /Strategic Planning/);
  assert.match(html, /Franchising/);
  assert.match(sitemap, /team\.html/);
});

test("publishes a structured, site-wide patient FAQ", async () => {
  const faq = await readFile(new URL("../public/faq.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  assert.match(faq, /"@type":"FAQPage"/);
  assert.match(faq, /Getting started/);
  assert.match(faq, /Injectables &amp; facial balancing/);
  assert.match(faq, /GLP-1 weight loss &amp; peptide care/);
  assert.match(faq, /Telehealth from home/);
  assert.match(faq, /Does the AI preview predict or guarantee my result\?/);
  assert.match(sitemap, /faq\.html/);
});

test("uses the enhanced Identity wall image softly in the closing band on every page", async () => {
  const peptideCss = await readFile(new URL("../public/peptide-education.css", import.meta.url), "utf8");
  const pages = [
    "index.html",
    "injectables.html",
    "medspa.html",
    "weight-loss.html",
    "peptides.html",
    "peptide-education.html",
    "locations.html",
    "about.html",
    "contact.html",
    "telehealth.html",
    "payment-plans.html",
    "glo2facial-treatments.html",
    "virtual-preview.html",
  ];

  for (const page of pages) {
    const html = await readFile(new URL(`../public/${page}`, import.meta.url), "utf8");
    const usesSharedStyles = ["peptides.html", "peptide-education.html", "payment-plans.html", "glo2facial-treatments.html", "virtual-preview.html"].includes(page);
    const styles = usesSharedStyles ? `${html}\n${peptideCss}` : html;
    assert.match(styles, /url\('images\/identity-signature-wall\.webp'\)/, `${page} should use the signature wall image`);
    assert.match(styles, /linear-gradient\(rgba\(20,17,13,\.84\),rgba\(20,17,13,\.84\)\)/, `${page} should preserve text contrast`);
    assert.match(html, /<section class="band">/, `${page} should keep the image confined to the closing band`);
  }
});

test("links the Med Spa Glo2Facial card to a current treatment options guide", async () => {
  const medspa = await readFile(new URL("../public/medspa.html", import.meta.url), "utf8");
  const guide = await readFile(new URL("../public/glo2facial-treatments.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const currentOptions = ["ExoFirm", "Hydrate", "Brighten", "Protect", "Refine", "Smooth", "Energize", "Clarify"];

  assert.match(medspa, /href="glo2facial-treatments\.html">Treatment Options<\/a>/);
  for (const option of currentOptions) {
    assert.match(guide, new RegExp(`>${option}<`), `guide should include ${option}`);
    assert.match(guide, new RegExp(`glo2facial\/${option.toLowerCase()}\\.jpg`), `guide should use the ${option} image`);
  }
  assert.doesNotMatch(guide, />Firm</);
  assert.doesNotMatch(guide, />Detox</);
  assert.match(sitemap, /glo2facial-treatments\.html/);
});

test("publishes the authorized Geneo guide as a complete internal luxury resource", async () => {
  const guide = await readFile(new URL("../public/glo2facial-treatments.html", import.meta.url), "utf8");
  assert.match(guide, /Solutions for All Skin Concerns/);
  assert.match(guide, /Oxfoliation™/);
  assert.match(guide, /LUX ultrasound/);
  assert.match(guide, /Bamboo Charcoal · Lactic Acid · Willow Bark/);
  assert.match(guide, /CICA Exosomes · 24K Gold · Peptides/);
  assert.match(guide, /Blue Spirulina · Niacinamide · PHA \/ Lactobionic Acid/);
  assert.match(guide, /Bilberry Extract · Salicylic Acid · Succinic Acid/);
  assert.match(guide, /provider-partner marketing authorization/);
  assert.match(guide, /"@type":"FAQPage"/);
  assert.match(guide, /object-fit:contain/);
  assert.doesNotMatch(guide, /Official Geneo details/);
  assert.doesNotMatch(guide, /shop\.geneo-us\.com/);
});

test("configures and promotes the supplied Ageless virtual preview responsibly", async () => {
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  const home = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const preview = await readFile(new URL("../public/virtual-preview.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  assert.match(worker, /contentType\.includes\("text\/html"\)/);
  assert.match(worker, /ageless-embed-launcher/);
  assert.match(worker, /9e964276-ce08-4944-b3d8-4b84eca026ea/);
  assert.match(worker, /data-ageless-label="See Your Future Self"/);
  assert.match(worker, /data-ageless-radius="rounded"/);
  assert.match(worker, /data-ageless-shadow="dramatic"/);
  assert.match(worker, /loader\.js/);
  assert.doesNotMatch(worker, /ageless-direct-launcher/);
  assert.match(home, /href="virtual-preview\.html">Try the Virtual Preview<\/a>/);
  assert.match(home, /illustrative simulations only—not predictions or guarantees/);
  assert.match(preview, /AI-generated visualization/);
  assert.match(preview, /not a prediction or guarantee/);
  assert.match(preview, /third-party Ageless AI experience/);
  assert.match(preview, /Launch See Your Future Self<\/a>/);
  assert.match(preview, /target="_blank" rel="noopener noreferrer"/);
  assert.match(preview, /ageless-embed-launcher/);
  assert.match(preview, /Book a Consultation/);
  assert.match(sitemap, /virtual-preview\.html/);
});
