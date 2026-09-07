import test from "node:test";
import assert from "node:assert/strict";
import { SMS_CONSENT_VERSION, validateConsultationPayload, verifyHumanPayload } from "../worker/consultation.ts";

const NOW = Date.parse("2026-09-03T12:00:00.000Z");

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Jane Doe",
    phone: "713-555-0100",
    email: "JANE@example.com",
    interest: "Peptide Therapy",
    care_mode: "In-office",
    location: "Houston",
    provider: "",
    contact_preference: "Email",
    notes: "I would like to schedule a consultation.",
    source: "Peptide Program for Women",
    marketing_consent: false,
    sms_consent_version: SMS_CONSENT_VERSION,
    sms_consent_timestamp: "",
    sms_consent_source_url: "",
    token: "payload.signature",
    answer: "5",
    startedAt: NOW - 5000,
    website: "",
    ...overrides,
  };
}

test("accepts a valid request without optional marketing consent", () => {
  const result = validateConsultationPayload(validPayload(), NOW);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.marketingConsent, false);
    assert.equal(result.data.smsConsentVersion, "");
    assert.equal(result.data.email, "jane@example.com");
  }
});

test("requires current consent metadata when marketing consent is checked", () => {
  const result = validateConsultationPayload(validPayload({ marketing_consent: true }), NOW);
  assert.equal(result.ok, false);
});

test("accepts checked marketing consent with a version, timestamp, and secure source", () => {
  const result = validateConsultationPayload(validPayload({
    marketing_consent: true,
    sms_consent_timestamp: new Date(NOW).toISOString(),
    sms_consent_source_url: "https://example.com/book-consultation.html",
  }), NOW);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.smsConsentVersion, SMS_CONSENT_VERSION);
});

test("rejects honeypot, invalid option, and inconsistent telehealth submissions", () => {
  assert.equal(validateConsultationPayload(validPayload({ website: "spam" }), NOW).ok, false);
  assert.equal(validateConsultationPayload(validPayload({ interest: "Anything" }), NOW).ok, false);
  assert.equal(validateConsultationPayload(validPayload({ care_mode: "Telehealth", location: "Houston" }), NOW).ok, false);
});

function base64Url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64url");
}

test("verifies a signed, correctly answered human challenge", async () => {
  const secret = "test-only-secret-with-enough-entropy";
  const payload = `2:3:${NOW - 10_000}:nonce`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  const token = `${base64Url(new TextEncoder().encode(payload))}.${base64Url(signature)}`;
  assert.deepEqual(await verifyHumanPayload({ token, answer: "5", startedAt: NOW - 5000 }, secret, NOW), { ok: true });
  assert.equal((await verifyHumanPayload({ token, answer: "6", startedAt: NOW - 5000 }, secret, NOW)).ok, false);
});
