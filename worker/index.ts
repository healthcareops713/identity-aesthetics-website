/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { legacyRedirect } from "./redirects";
import {
  REQUEST_CONTACT_DISCLOSURE_VERSION,
  SMS_CONSENT_DISCLOSURE,
  secureHash,
  sendConsultationEmail,
  validateConsultationPayload,
  verifyHumanPayload,
} from "./consultation";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  BOT_PROTECTION_SECRET?: string;
  GOOGLE_MAIL_WEBHOOK_URL?: string;
  GOOGLE_MAIL_WEBHOOK_SECRET?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

const encoder = new TextEncoder();
const verificationAttempts = new Map<string, { count: number; resetAt: number }>();

function requestOriginAccepted(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function createChallenge(secret: string) {
  const first = 2 + crypto.getRandomValues(new Uint8Array(1))[0] % 8;
  const second = 1 + crypto.getRandomValues(new Uint8Array(1))[0] % 9;
  const issuedAt = Date.now();
  const nonce = crypto.randomUUID();
  const payload = `${first}:${second}:${issuedAt}:${nonce}`;
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(payload)));
  return {
    question: `What is ${first} + ${second}?`,
    token: `${toBase64Url(encoder.encode(payload))}.${toBase64Url(signature)}`,
  };
}

function rateLimited(request: Request) {
  const now = Date.now();
  if (verificationAttempts.size > 5000) {
    for (const [key, value] of verificationAttempts) {
      if (value.resetAt <= now) verificationAttempts.delete(key);
    }
    if (verificationAttempts.size > 5000) verificationAttempts.clear();
  }
  const address = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
  const current = verificationAttempts.get(address);
  if (!current || current.resetAt <= now) {
    verificationAttempts.set(address, { count: 1, resetAt: now + 10 * 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 12;
}

async function verifyChallenge(request: Request, secret: string) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return jsonResponse({ ok: false, message: "Verification request was not accepted." }, 403);
  }
  if (rateLimited(request)) {
    return jsonResponse({ ok: false, message: "Too many verification attempts. Please wait a few minutes or call us." }, 429, { "retry-after": "600" });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) return jsonResponse({ ok: false, message: "Invalid request." }, 413);

  let body: { token?: unknown; answer?: unknown; website?: unknown; startedAt?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: "Invalid verification request." }, 400);
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return jsonResponse({ ok: false, message: "Verification could not be completed." }, 400);
  }
  if (typeof body.token !== "string" || typeof body.answer !== "string" || typeof body.startedAt !== "number") {
    return jsonResponse({ ok: false, message: "Please complete the human verification." }, 400);
  }

  const elapsed = Date.now() - body.startedAt;
  if (elapsed < 2500 || elapsed > 30 * 60_000) {
    return jsonResponse({ ok: false, message: elapsed < 2500 ? "Please take a moment and try again." : "Verification expired. Please refresh it." }, 400);
  }

  const parts = body.token.split(".");
  if (parts.length !== 2) return jsonResponse({ ok: false, message: "Verification expired. Please refresh it." }, 400);

  try {
    const payloadBytes = fromBase64Url(parts[0]);
    const signature = fromBase64Url(parts[1]);
    const validSignature = await crypto.subtle.verify("HMAC", await hmacKey(secret), signature, payloadBytes);
    if (!validSignature) throw new Error("signature");

    const payload = new TextDecoder().decode(payloadBytes);
    const [firstText, secondText, issuedText] = payload.split(":");
    const first = Number(firstText);
    const second = Number(secondText);
    const issuedAt = Number(issuedText);
    const tokenAge = Date.now() - issuedAt;
    if (!Number.isInteger(first) || !Number.isInteger(second) || tokenAge < 0 || tokenAge > 10 * 60_000) {
      throw new Error("expired");
    }
    if (Number(body.answer.trim()) !== first + second) {
      return jsonResponse({ ok: false, message: "That answer does not match. Please try again." }, 400);
    }
  } catch {
    return jsonResponse({ ok: false, message: "Verification expired. Please refresh it." }, 400);
  }

  return jsonResponse({ ok: true });
}

async function submitConsultation(request: Request, env: Env, secret: string) {
  if (!requestOriginAccepted(request)) return jsonResponse({ ok: false, message: "Submission request was not accepted." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse({ ok: false, message: "Invalid submission format." }, 415);
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 20_000) return jsonResponse({ ok: false, message: "Submission is too large." }, 413);

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse({ ok: false, message: "Invalid submission." }, 400);
  }

  const validated = validateConsultationPayload(body);
  if (!validated.ok) return jsonResponse({ ok: false, message: validated.message }, 400);
  const human = await verifyHumanPayload(validated.data, secret);
  if (!human.ok) return jsonResponse({ ok: false, message: human.message }, 400);

  if (validated.data.marketingConsent) {
    try {
      if (new URL(validated.data.smsConsentSourceUrl).origin !== new URL(request.url).origin) {
        return jsonResponse({ ok: false, message: "We could not verify the optional text consent source. Please try again." }, 400);
      }
    } catch {
      return jsonResponse({ ok: false, message: "We could not verify the optional text consent source. Please try again." }, 400);
    }
  }

  const webhookUrl = env.GOOGLE_MAIL_WEBHOOK_URL?.trim();
  const webhookSecret = env.GOOGLE_MAIL_WEBHOOK_SECRET;
  if (!env.DB || !webhookUrl || !webhookSecret) {
    return jsonResponse({ ok: false, message: "Secure online requests are being connected. Please call or text 713-BOTOX-ME for immediate help." }, 503);
  }

  const now = new Date();
  const submittedAt = now.toISOString();
  const address = request.headers.get("cf-connecting-ip") || "unknown";
  const ipHash = await secureHash(address, secret);
  const tokenHash = await secureHash(validated.data.token, secret);
  const recentSince = new Date(now.getTime() - 15 * 60_000).toISOString();

  try {
    const recent = await env.DB.prepare("SELECT COUNT(*) AS count FROM consultation_submissions WHERE ip_hash = ? AND submitted_at >= ?")
      .bind(ipHash, recentSince).first<{ count: number }>();
    if (Number(recent?.count || 0) >= 5) {
      return jsonResponse({ ok: false, message: "Too many requests were submitted. Please wait 15 minutes or call us." }, 429, { "retry-after": "900" });
    }
  } catch (error) {
    console.error("Consultation rate-limit lookup failed", error instanceof Error ? error.message : "unknown");
    return jsonResponse({ ok: false, message: "We could not securely record your request. Please call or text us." }, 503);
  }

  const submissionId = crypto.randomUUID();
  const consentServerTimestamp = validated.data.marketingConsent ? submittedAt : null;
  try {
    await env.DB.prepare(`INSERT INTO consultation_submissions (
      id, submitted_at, name, phone, email, interest, care_mode, location, provider,
      contact_preference, notes, source, request_contact_disclosure_version,
      marketing_consent, sms_consent_version, sms_consent_client_timestamp,
      sms_consent_server_timestamp, sms_consent_source_url, sms_consent_disclosure,
      verification_token_hash, ip_hash, user_agent, email_status, email_message_id, email_updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        submissionId, submittedAt, validated.data.name, validated.data.phone, validated.data.email,
        validated.data.interest, validated.data.careMode, validated.data.location, validated.data.provider || null,
        validated.data.contactPreference, validated.data.notes || null, validated.data.source || null,
        REQUEST_CONTACT_DISCLOSURE_VERSION, validated.data.marketingConsent ? 1 : 0,
        validated.data.smsConsentVersion || null, validated.data.smsConsentClientTimestamp || null,
        consentServerTimestamp, validated.data.smsConsentSourceUrl || null,
        validated.data.marketingConsent ? SMS_CONSENT_DISCLOSURE : null,
        tokenHash, ipHash, (request.headers.get("user-agent") || "").slice(0, 500) || null,
        "pending", null, submittedAt,
      ).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (/unique|constraint/i.test(message)) return jsonResponse({ ok: false, message: "This request was already submitted. Refresh the verification before trying again." }, 409);
    console.error("Consultation record insert failed", message);
    return jsonResponse({ ok: false, message: "We could not securely record your request. Please call or text us." }, 503);
  }

  try {
    await sendConsultationEmail({ webhookUrl, webhookSecret }, submissionId, submittedAt, validated.data);
  } catch (error) {
    console.error("Consultation email delivery failed", error instanceof Error ? error.message : "unknown");
    try {
      await env.DB.prepare("UPDATE consultation_submissions SET email_status = ?, email_updated_at = ? WHERE id = ?")
        .bind("failed", new Date().toISOString(), submissionId).run();
    } catch (updateError) {
      console.error("Consultation email status update failed", updateError instanceof Error ? updateError.message : "unknown");
    }
    return jsonResponse({ ok: false, submissionId, message: "Your request was recorded, but the email notification could not be delivered. Please call or text 713-BOTOX-ME so we can help right away." }, 503);
  }

  try {
    await env.DB.prepare("UPDATE consultation_submissions SET email_status = ?, email_message_id = ?, email_updated_at = ? WHERE id = ?")
      .bind("sent", null, new Date().toISOString(), submissionId).run();
  } catch (error) {
    console.error("Consultation sent-status update failed", error instanceof Error ? error.message : "unknown");
  }
  return jsonResponse({ ok: true, submissionId, message: "Your request was sent securely. Our team will contact you soon." }, 201);
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const AGELESS_LAUNCHER = `<script defer src="/ageless-launcher.js?v=125"></script>`;

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

// Cloudflare keeps serving this Worker on its *.workers.dev hostname even after
// a custom domain is attached, which would leave a second crawlable copy of the
// entire site competing with the real one. Search engines are told to ignore
// that copy. The rule is keyed on the request hostname, so 713botoxme.com is
// never affected, and nothing about how the pages behave for visitors changes -
// the preview stays fully usable, forms included.
const PREVIEW_HOST_SUFFIX = ".workers.dev";

const isPreviewHost = (hostname: string) => hostname.endsWith(PREVIEW_HOST_SUFFIX);

// 204, 205 and 304 must not carry a body; rebuilding one with a body throws.
const BODYLESS_STATUSES = new Set([204, 205, 304]);

const withPreviewNoindex = (url: URL, response: Response) => {
  if (!isPreviewHost(url.hostname)) return response;
  const headers = new Headers(response.headers);
  headers.set("x-robots-tag", "noindex, nofollow");
  return new Response(BODYLESS_STATUSES.has(response.status) ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

// The production robots.txt invites crawling and points at the live sitemap.
// A preview host must do neither.
const PREVIEW_ROBOTS = "User-agent: *\nDisallow: /\n";

async function routeRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 301s from the previous WordPress site, before any other routing
    const redirect = legacyRedirect(url);
    if (redirect) return redirect;

    if (isPreviewHost(url.hostname) && url.pathname === "/robots.txt") {
      return new Response(PREVIEW_ROBOTS, {
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
      });
    }

    if (url.pathname === "/api/human-verification/challenge" && request.method === "GET") {
      const secret = env.BOT_PROTECTION_SECRET || (url.hostname === "terminal.local" ? "identity-local-preview-only" : "");
      if (!secret) return jsonResponse({ ok: false, message: "Human verification is temporarily unavailable. Please call or text us." }, 503);
      const challenge = await createChallenge(secret);
      return jsonResponse({ ok: true, ...challenge, expiresInSeconds: 600 });
    }

    if (url.pathname === "/api/human-verification/verify" && request.method === "POST") {
      const secret = env.BOT_PROTECTION_SECRET || (url.hostname === "terminal.local" ? "identity-local-preview-only" : "");
      if (!secret) return jsonResponse({ ok: false, message: "Human verification is temporarily unavailable. Please call or text us." }, 503);
      return verifyChallenge(request, secret);
    }

    if (url.pathname === "/api/consultation" && request.method === "POST") {
      const secret = env.BOT_PROTECTION_SECRET || (url.hostname === "terminal.local" ? "identity-local-preview-only" : "");
      if (!secret) return jsonResponse({ ok: false, message: "Secure online requests are temporarily unavailable. Please call or text us." }, 503);
      return submitConsultation(request, env, secret);
    }

    if (url.pathname === "/api/consultation") {
      return jsonResponse({ ok: false, message: "Method not allowed." }, 405, { allow: "POST" });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("text/html")) {
      const html = await response.text();
      const currentHtml = html.replaceAll("site-enhancements.js?v=96", "site-enhancements.js?v=98");
      if (!currentHtml.includes("ageless-launcher.js") && currentHtml.includes("</body>")) {
        return new Response(currentHtml.replace("</body>", `${AGELESS_LAUNCHER}\n</body>`), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
      return new Response(currentHtml, { status: response.status, statusText: response.statusText, headers: response.headers });
    }

    return response;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return withPreviewNoindex(new URL(request.url), await routeRequest(request, env, ctx));
  },
};

export default worker;
