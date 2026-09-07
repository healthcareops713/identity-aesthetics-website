(function () {
  "use strict";

  var root = document.documentElement;
  if (root.dataset.iaAgelessInitialized === "true") return;
  root.dataset.iaAgelessInitialized = "true";

  var approvedHosts = new Set(["713botoxme.com", "www.713botoxme.com"]);
  var embedUrl = "https://www.ageless.ai/embed/platforms/9e964276-ce08-4944-b3d8-4b84eca026ea/a/713botoxme/transformation?utm_source=website_embed&utm_medium=embed";
  var directUrl = new URL("https://www.ageless.ai/en-US/a/713botoxme/transformation/pre-scan");
  directUrl.searchParams.set("utm_source", "identity_aesthetics_website");
  directUrl.searchParams.set("utm_medium", "floating_fallback");
  directUrl.searchParams.set("utm_campaign", (location.pathname.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "homepage").toLowerCase());

  var host = null;
  var loader = null;
  var readinessTimer = null;

  function clearReadinessTimer() {
    if (readinessTimer) window.clearInterval(readinessTimer);
    readinessTimer = null;
  }

  function showDirectFallback(reason) {
    clearReadinessTimer();
    if (host) host.remove();
    if (loader) loader.remove();
    if (document.querySelector(".ia-ageless-fallback")) return;

    var link = document.createElement("a");
    link.className = "ia-ageless-fallback";
    link.href = directUrl.toString();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "See Your Future Self with Ageless AI (opens in a new tab)");
    link.innerHTML = "<span>See Your Future Self</span><i aria-hidden=\"true\">↗</i>";
    link.dataset.fallbackReason = reason;
    document.body.appendChild(link);
    if (document.querySelector(".peptide-safety-float")) document.body.classList.add("ia-has-peptide-safety");
    root.dataset.iaAgelessStatus = "direct-fallback";
  }

  function initializeEmbed() {
    root.dataset.iaAgelessStatus = "embed-loading";
    host = document.createElement("ageless-embed-launcher");
    host.setAttribute("data-ageless-url", embedUrl);
    host.setAttribute("data-ageless-mode", "floating");
    host.setAttribute("data-ageless-label", "See Your Future Self");
    host.setAttribute("data-ageless-color", "#805716");
    host.setAttribute("data-ageless-position", "right");
    host.setAttribute("data-ageless-radius", "rounded");
    host.setAttribute("data-ageless-shadow", "dramatic");
    document.body.appendChild(host);

    loader = document.createElement("script");
    loader.async = true;
    loader.src = "https://www.ageless.ai/embed/v1/loader.js";
    loader.onerror = function () { showDirectFallback("loader-error"); };
    document.body.appendChild(loader);

    var deadline = Date.now() + 8000;
    readinessTimer = window.setInterval(function () {
      var button = host && host.shadowRoot && host.shadowRoot.querySelector("button");
      if (button) {
        clearReadinessTimer();
        root.dataset.iaAgelessStatus = "embed-ready";
        return;
      }
      if (Date.now() >= deadline) showDirectFallback("loader-timeout");
    }, 200);
  }

  function start() {
    if (!approvedHosts.has(location.hostname.toLowerCase())) {
      showDirectFallback("unapproved-domain");
      return;
    }
    initializeEmbed();
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
