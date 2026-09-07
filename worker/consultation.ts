const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SMS_CONSENT_VERSION = "IA-SMS-2026-08-06";
export const REQUEST_CONTACT_DISCLOSURE_VERSION = "IA-REQUEST-CONTACT-2026-09-03";
export const SMS_CONSENT_DISCLOSURE = "I agree to receive recurring automated marketing and promotional text messages from Identity Aesthetics at the mobile number provided. Consent is not a condition of purchase or treatment. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.";

const INTERESTS = new Set([
  "Injectables & Facial Balancing", "Botox / Dysport / Xeomin / Jeuveau", "Dermal or Lip Filler",
  "Laser Rejuvenation / LaseMD / Sciton BBL", "Facials / Lashes / Brows / Skin",
  "Microneedling / Dermaplaning", "Body Contouring", "Laser Hair Removal",
  "Vaginal Rejuvenation with HIFU", "GLP-1 Medical Weight Loss", "Hormone Optimization",
  "Peptide Therapy", "Not Sure — Help Me Choose",
]);
const CARE_MODES = new Set(["In-office", "Telehealth"]);
const LOCATIONS = new Set(["Conroe", "Houston", "Fulshear", "Katy", "Kingwood", "Telehealth", "No preference"]);
const PROVIDERS = new Set(["", "Ike Nwanonyiri, MD", "Dallas Alvey, MD, DDS", "Sarah Walker, APRN, FNP-C", "Astrid Ariano", "Patrisia L., CLT"]);
const CONTACT_PREFERENCES = new Set(["Text message", "Phone call", "Email"]);

export interface ConsultationInput {
  name: string;
  phone: string;
  email: string;
  interest: string;
  careMode: string;
  location: string;
  provider: string;
  contactPreference: string;
  notes: string;
  source: string;
  marketingConsent: boolean;
  smsConsentVersion: string;
  smsConsentClientTimestamp: string;
  smsConsentSourceUrl: string;
  token: string;
  answer: string;
  startedAt: number;
}

export type ValidationResult = { ok: true; data: ConsultationInput } | { ok: false; message: string };

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max) : "";
}

function validIsoDate(value: string, now: number) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && Math.abs(now - parsed) <= 30 * 60_000;
}

export function validateConsultationPayload(body: Record<string, unknown>, now = Date.now()): ValidationResult {
  if (text(body.website, 200)) return { ok: false, message: "Submission could not be accepted." };

  const name = text(body.name, 100);
  const phone = text(body.phone, 40);
  const email = text(body.email, 254).toLowerCase();
  const interest = text(body.interest, 100);
  const careMode = text(body.care_mode, 30);
  const location = text(body.location, 40);
  const provider = text(body.provider, 100);
  const contactPreference = text(body.contact_preference, 30);
  const notes = text(body.notes, 500);
  const source = text(body.source, 300);
  const marketingConsent = body.marketing_consent === true || body.marketing_consent === "Yes";
  const smsConsentVersion = text(body.sms_consent_version, 80);
  const smsConsentClientTimestamp = text(body.sms_consent_timestamp, 50);
  const smsConsentSourceUrl = text(body.sms_consent_source_url, 500);
  const token = text(body.token, 2048);
  const answer = text(body.answer, 20);
  const startedAt = typeof body.startedAt === "number" ? body.startedAt : Number(body.human_started_at);

  if (name.length < 2 || !/^[\p{L}\p{M} .'’-]+$/u.test(name)) return { ok: false, message: "Please enter a valid full name." };
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 15) return { ok: false, message: "Please enter a valid mobile number." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, message: "Please enter a valid email address." };
  if (!INTERESTS.has(interest) || !CARE_MODES.has(careMode) || !LOCATIONS.has(location) || !PROVIDERS.has(provider) || !CONTACT_PREFERENCES.has(contactPreference)) {
    return { ok: false, message: "Please review the selected consultation options." };
  }
  if (careMode === "Telehealth" && location !== "Telehealth" && location !== "No preference") {
    return { ok: false, message: "Please select Telehealth as the location for a telehealth visit." };
  }
  if (!token || !answer || !Number.isFinite(startedAt)) return { ok: false, message: "Please complete the human verification." };

  if (marketingConsent) {
    if (smsConsentVersion !== SMS_CONSENT_VERSION || !validIsoDate(smsConsentClientTimestamp, now)) {
      return { ok: false, message: "We could not record the optional text consent accurately. Please review the checkbox and try again." };
    }
    try {
      const consentUrl = new URL(smsConsentSourceUrl);
      if (consentUrl.protocol !== "https:" && consentUrl.hostname !== "terminal.local") throw new Error("protocol");
    } catch {
      return { ok: false, message: "We could not record the optional text consent source. Please try again." };
    }
  }

  return { ok: true, data: { name, phone, email, interest, careMode, location, provider, contactPreference, notes, source, marketingConsent, smsConsentVersion: marketingConsent ? smsConsentVersion : "", smsConsentClientTimestamp: marketingConsent ? smsConsentClientTimestamp : "", smsConsentSourceUrl: marketingConsent ? smsConsentSourceUrl : "", token, answer, startedAt } };
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function verifyHumanPayload(data: Pick<ConsultationInput, "token" | "answer" | "startedAt">, secret: string, now = Date.now()) {
  const elapsed = now - data.startedAt;
  if (elapsed < 2500) return { ok: false, message: "Please take a moment and try again." };
  if (elapsed > 30 * 60_000) return { ok: false, message: "Verification expired. Please refresh it." };
  const parts = data.token.split(".");
  if (parts.length !== 2) return { ok: false, message: "Verification expired. Please refresh it." };
  try {
    const payloadBytes = fromBase64Url(parts[0]);
    const signature = fromBase64Url(parts[1]);
    if (!await crypto.subtle.verify("HMAC", await hmacKey(secret), signature, payloadBytes)) throw new Error("signature");
    const [firstText, secondText, issuedText] = decoder.decode(payloadBytes).split(":");
    const first = Number(firstText), second = Number(secondText), issuedAt = Number(issuedText);
    if (!Number.isInteger(first) || !Number.isInteger(second) || now < issuedAt || now - issuedAt > 10 * 60_000) throw new Error("expired");
    if (Number(data.answer) !== first + second) return { ok: false, message: "That answer does not match. Please try again." };
    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "Verification expired. Please refresh it." };
  }
}

export async function secureHash(value: string, secret: string) {
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(value)));
  return toBase64Url(signature);
}

export async function sendConsultationEmail(config: { webhookUrl: string; webhookSecret: string }, submissionId: string, submittedAt: string, data: ConsultationInput) {
  const payload = JSON.stringify({
    submissionId,
    submittedAt,
    name: data.name,
    phone: data.phone,
    email: data.email,
    interest: data.interest,
    careMode: data.careMode,
    location: data.location,
    provider: data.provider || "No preference",
    contactPreference: data.contactPreference,
    notes: data.notes || "None provided",
    source: data.source || "Direct visit",
    marketingConsent: data.marketingConsent,
    smsConsentVersion: data.smsConsentVersion,
    smsConsentClientTimestamp: data.smsConsentClientTimestamp,
    smsConsentServerTimestamp: data.marketingConsent ? submittedAt : "",
    smsConsentSourceUrl: data.smsConsentSourceUrl,
    smsConsentDisclosure: data.marketingConsent ? SMS_CONSENT_DISCLOSURE : "",
    requestContactDisclosureVersion: REQUEST_CONTACT_DISCLOSURE_VERSION,
  });
  const signature = await secureHash(payload, config.webhookSecret);
  const response = await fetch(config.webhookUrl, {
    method: "POST",
    headers: { "content-type": "text/plain; charset=UTF-8", "accept": "application/json" },
    body: JSON.stringify({ payload, signature }),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Google mail webhook rejected the message (${response.status}).`);
  const result = await response.json() as { ok?: boolean; error?: string };
  if (!result.ok) throw new Error(result.error || "Google mail webhook did not confirm delivery.");
}
