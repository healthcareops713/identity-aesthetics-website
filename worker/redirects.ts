/**
 * 301 redirects from the previous WordPress site.
 *
 * Every URL below appeared in that site's sitemap. Without these, each one
 * becomes a 404 the day the domain switches over, and the search history
 * attached to it is lost. City-qualified URLs are sent to the matching city
 * page so the location keyword is preserved rather than diluted into a
 * generic treatment page.
 *
 * Keys are lower-case, leading slash, trailing slash. Lookup normalises both
 * slash variants, so "/contact" and "/contact/" both match.
 */
/**
 * URLs that should cease to exist rather than move.
 *
 * A 301 tells search engines the page relocated and passes its history to the
 * target. For junk that was never ours, that is the wrong signal - it keeps the
 * URL alive in the index and associates it with the homepage. A 410 Gone asks
 * for removal outright, which is what we want here.
 */
export const GONE_URLS = new Set<string>([
  // Left over from whatever template the old WordPress site was built from.
  // Nothing to do with this practice.
  "/thank-you-for-contacting-taps-pest-control/",
]);

const GONE_BODY = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Page not available | Identity Aesthetics</title></head>
<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:12vh auto;padding:0 1.5rem;line-height:1.6">
<h1 style="font-weight:500">This page no longer exists</h1>
<p>It was removed and will not be coming back. <a href="/">Go to the Identity Aesthetics homepage</a>, or call
<a href="tel:713-268-6963">713-BOTOX-ME</a>.</p></body></html>`;

export const LEGACY_REDIRECTS: Record<string, string> = {
  // --- core pages ---
  "/contact/": "/contact.html",
  "/about/": "/about.html",
  "/locations/": "/locations.html",
  "/meet-the-team/": "/team.html",
  "/privacy-policy/": "/privacy.html",
  "/blog/": "/journal.html",
  "/beauty-personal-care-faqs/": "/faq.html",
  "/services/": "/treatments.html",
  "/med-spa-services/": "/treatments.html",

  // --- location pages -> city landing pages ---
  "/locations/botox-in-conroe-texas/": "/botox-conroe-tx.html",
  "/locations/botox-in-houston-tx/": "/botox-houston-tx.html",
  "/locations/botox-in-katy-tx/": "/botox-katy-tx.html",
  "/locations/botox-in-fulshear-tx/": "/botox-fulshear-tx.html",

  // --- city-qualified service pages -> city landing pages ---
  "/med-spa-services/botox-conroe-texas/": "/botox-conroe-tx.html",
  "/med-spa-services/botox-conroe-tx/": "/botox-conroe-tx.html",
  "/med-spa-services/lip-fillers-conroe-tx/": "/botox-conroe-tx.html",
  "/med-spa-services/lip-fillers-conroe-tx-2/": "/botox-conroe-tx.html",
  "/med-spa-services/dermal-fillers-conroe-tx/": "/botox-conroe-tx.html",
  "/med-spa-services/injectables-conroe-tx/": "/botox-conroe-tx.html",
  "/med-spa-services/med-spa-conroe-tx/": "/botox-conroe-tx.html",

  // --- treatment pages ---
  "/med-spa-services/pdo-threads/": "/treatment-pdo-threads.html",
  "/med-spa-services/laser-hair-removal/": "/treatment-laser-hair-removal.html",
  "/med-spa-services/body-sculpting/": "/treatment-body-contouring.html",
  "/med-spa-services/medical-weight-loss-programs/": "/weight-loss.html",
  "/med-spa-services/mens-health/": "/treatment-hormone-optimization-men.html",
  "/med-spa-services/hormone-replacement-therapy/": "/treatments.html",
  "/med-spa-services/facials/": "/medspa.html",
  "/med-spa-services/laser-facial/": "/treatment-laser-rejuvenation.html",
  "/med-spa-services/ipl-laser-treatment/": "/treatment-sciton-profile-bbl.html",
  "/med-spa-services/specialty-services/": "/treatments.html",

  // --- services rebuilt from the old site's own content ---
  //     training is no longer offered, so it goes to the treatment library
  "/med-spa-services/massage/": "/treatment-massage.html",
  "/med-spa-services/hair-restoration/": "/treatment-hair-restoration.html",
  "/training/": "/treatments.html",

  // --- blog posts -> nearest topic ---
  "/blog/what-to-know-before-booking-botox-in-conroe/": "/botox-conroe-tx.html",
  "/blog/questions-to-ask-before-lip-fillers-in-conroe/": "/treatment-lip-filler.html",
  "/blog/botox-vs-dermal-fillers-whats-the-difference/": "/injectables.html",
  "/blog/how-to-choose-a-med-spa-in-conroe/": "/botox-conroe-tx.html",
  "/blog/facial-enhancement/": "/treatment-complete-facial-balancing.html",
  "/blog/monthly-facial/": "/medspa.html",
  "/blog/aesthetic-injectors/": "/team.html",

  // --- drafts, tests and duplicates that were indexed ---
  "/thank-you/": "/",
  "/home-new/": "/",
  "/landing-page/": "/",
  "/test-page/": "/",
  "/gh/": "/",
  "/med-spa-services-old/": "/treatments.html",
  "/med-spa-services-old/body-sculpting-old/": "/treatment-body-contouring.html",
  "/med-spa-services-old2/expert-aesthetic-botched-work-repair-5/": "/treatment-botched-filler-correction.html",
  "/identity-aesthetics-aesthetic-treatments-cloned-91179/": "/treatments.html",
  "/lp/identity-aesthetics-aesthetic-treatment/": "/treatments.html",
};

/**
 * Returns a 301 for a known legacy path, or null to continue normal handling.
 * Query strings are carried across so campaign tags survive the redirect.
 */
export function legacyRedirect(url: URL): Response | null {
  const raw = url.pathname.toLowerCase();
  const withSlash = raw.endsWith("/") ? raw : `${raw}/`;

  if (GONE_URLS.has(withSlash) || GONE_URLS.has(raw)) {
    return new Response(GONE_BODY, {
      status: 410,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex",
        "cache-control": "no-store",
      },
    });
  }

  const target = LEGACY_REDIRECTS[withSlash] ?? LEGACY_REDIRECTS[raw];
  if (!target) return null;

  const destination = new URL(target, url.origin);
  destination.search = url.search;
  return Response.redirect(destination.toString(), 301);
}
