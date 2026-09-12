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

  // Content-free scaffolding that was indexed by accident. These carry no
  // history worth preserving, so removal beats redirecting them to the
  // homepage and leaving the URLs alive in the index.
  "/test-page/",
  "/gh/",
  "/home-new/",
  "/landing-page/",
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
  "/contact/": "/contact",
  "/about/": "/about",
  "/locations/": "/locations",
  "/meet-the-team/": "/team",
  "/privacy-policy/": "/privacy",
  "/blog/": "/journal",
  "/beauty-personal-care-faqs/": "/faq",
  "/services/": "/treatments",
  "/med-spa-services/": "/treatments",

  // --- location pages -> city landing pages ---
  "/locations/botox-in-conroe-texas/": "/botox-conroe-tx",
  "/locations/botox-in-houston-tx/": "/botox-houston-tx",
  "/locations/botox-in-katy-tx/": "/botox-katy-tx",
  "/locations/botox-in-fulshear-tx/": "/botox-fulshear-tx",

  // --- city-qualified service pages -> city landing pages ---
  "/med-spa-services/botox-conroe-texas/": "/botox-conroe-tx",
  "/med-spa-services/botox-conroe-tx/": "/botox-conroe-tx",
  "/med-spa-services/lip-fillers-conroe-tx/": "/botox-conroe-tx",
  "/med-spa-services/lip-fillers-conroe-tx-2/": "/botox-conroe-tx",
  "/med-spa-services/dermal-fillers-conroe-tx/": "/botox-conroe-tx",
  "/med-spa-services/injectables-conroe-tx/": "/botox-conroe-tx",
  "/med-spa-services/med-spa-conroe-tx/": "/botox-conroe-tx",

  // --- treatment pages ---
  "/med-spa-services/pdo-threads/": "/treatment-pdo-threads",
  "/med-spa-services/laser-hair-removal/": "/treatment-laser-hair-removal",
  "/med-spa-services/body-sculpting/": "/treatment-body-contouring",
  "/med-spa-services/medical-weight-loss-programs/": "/weight-loss",
  "/med-spa-services/mens-health/": "/treatment-hormone-optimization-men",
  "/med-spa-services/hormone-replacement-therapy/": "/treatments",
  "/med-spa-services/facials/": "/medspa",
  "/med-spa-services/laser-facial/": "/treatment-laser-rejuvenation",
  "/med-spa-services/ipl-laser-treatment/": "/treatment-sciton-profile-bbl",
  "/med-spa-services/specialty-services/": "/treatments",

  // --- services rebuilt from the old site's own content ---
  //     training is no longer offered, so it goes to the treatment library
  "/med-spa-services/massage/": "/treatment-massage",
  "/med-spa-services/hair-restoration/": "/treatment-hair-restoration",
  "/training/": "/treatments",

  // --- blog posts -> nearest topic ---
  "/blog/what-to-know-before-booking-botox-in-conroe/": "/botox-conroe-tx",
  "/blog/questions-to-ask-before-lip-fillers-in-conroe/": "/treatment-lip-filler",
  "/blog/botox-vs-dermal-fillers-whats-the-difference/": "/injectables",
  "/blog/how-to-choose-a-med-spa-in-conroe/": "/botox-conroe-tx",
  "/blog/facial-enhancement/": "/treatment-complete-facial-balancing",
  "/blog/monthly-facial/": "/medspa",
  "/blog/aesthetic-injectors/": "/team",

  // --- superseded pages, still worth redirecting: they had real content ---
  "/thank-you/": "/",
  "/med-spa-services-old/": "/treatments",
  "/med-spa-services-old/body-sculpting-old/": "/treatment-body-contouring",
  "/med-spa-services-old2/expert-aesthetic-botched-work-repair-5/": "/treatment-botched-filler-correction",
  "/identity-aesthetics-aesthetic-treatments-cloned-91179/": "/treatments",
  "/lp/identity-aesthetics-aesthetic-treatment/": "/treatments",
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

  // Now that the site serves extension-less URLs, several legacy paths differ
  // from their target only by a trailing slash (/contact/ -> /contact). The
  // slash-insensitive lookup above would then match the target itself and
  // redirect it to itself, forever. Never redirect a path to where it already is.
  if (target === raw || target === withSlash) return null;

  const destination = new URL(target, url.origin);
  destination.search = url.search;
  return Response.redirect(destination.toString(), 301);
}
