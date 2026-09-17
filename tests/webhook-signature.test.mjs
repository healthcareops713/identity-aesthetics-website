import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { secureHash } from "../worker/consultation.ts";

/**
 * The Worker signs the consultation payload and the Apps Script web app
 * verifies that signature before it will email anything. The two are written
 * in different languages against different crypto libraries, so if they ever
 * disagree the failure is silent: submissions are stored, the webhook returns
 * "Unauthorized request.", and nobody at the practice is emailed.
 *
 * This reimplements exactly what google-apps-script/Code.gs does:
 *   Utilities.base64EncodeWebSafe(
 *     Utilities.computeHmacSha256Signature(payload, secret)
 *   ).replace(/=+$/, "")
 */
function appsScriptSignature(payload, secret) {
  return createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const SECRET = "a-long-random-webhook-secret-value-for-testing-only";

test("the Worker's signature is what the Apps Script will verify", async () => {
  const payloads = [
    JSON.stringify({ submissionId: "abc123", name: "Jane Doe", interest: "Botox" }),
    JSON.stringify({ name: "José Muñoz", notes: "Æther — em-dash, ünïcode" }),
    JSON.stringify({ notes: 'line1\nline2\ttab "quotes" \'apos\' <html>' }),
    JSON.stringify({ notes: "emoji 🎉 and 中文 and ß" }),
    "",
    "x".repeat(5000),
  ];

  for (const payload of payloads) {
    assert.equal(
      await secureHash(payload, SECRET),
      appsScriptSignature(payload, SECRET),
      `signature mismatch for payload of length ${payload.length}`,
    );
  }
});

test("a wrong secret does not produce a matching signature", async () => {
  const payload = JSON.stringify({ submissionId: "abc123" });
  assert.notEqual(
    await secureHash(payload, SECRET),
    appsScriptSignature(payload, `${SECRET}-rotated`),
    "a rotated secret must invalidate old signatures",
  );
});

test("the signature is URL-safe base64 with no padding", async () => {
  for (let i = 0; i < 40; i += 1) {
    const sig = await secureHash(JSON.stringify({ n: i, pad: "y".repeat(i) }), SECRET);
    assert.match(sig, /^[A-Za-z0-9_-]+$/, `signature ${sig} must be URL-safe and unpadded`);
  }
});

test("the Apps Script still signs the payload, not the envelope", async () => {
  // Code.gs verifies envelope.signature against sign(envelope.payload). If the
  // Worker ever signed the whole envelope instead, every request would fail.
  const src = await readFile(new URL("../google-apps-script/Code.gs", import.meta.url), "utf8");
  assert.match(src, /signPayload\(payload,\s*secret\)/, "Code.gs must sign the payload field");
  assert.match(src, /computeHmacSha256Signature\(payload,\s*secret\)/, "Code.gs must HMAC the payload with the secret");
  assert.match(src, /base64EncodeWebSafe/, "Code.gs must use URL-safe base64");
});
