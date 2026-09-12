import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("protects the site-controlled consultation form with layered verification", async () => {
  const html = await read("public/book-consultation.html");
  assert.match(html, /data-bot-protected="true"/);
  assert.match(html, /class="bot-trap"/);
  assert.match(html, /id="human-answer"/);
  assert.match(html, /id="consultation-submit"/);
  assert.match(html, />Send My Consultation Request</);
  assert.match(html, /id="refresh-challenge"/, "the visitor must be able to request a new question");
});

test("verification is enforced on the server before anything is stored", async () => {
  const script = await read("public/conversion-flow.js");
  const worker = await read("worker/index.ts");
  const consultation = await read("worker/consultation.ts");

  // The client fetches a signed challenge and sends the answer with the
  // submission. Verification happens server-side at submit time rather than in
  // a separate client call, so it cannot be skipped by not making that call.
  assert.match(script, /\/api\/human-verification\/challenge/);
  assert.match(worker, /verifyHumanPayload/, "the worker must verify the challenge answer");

  const submit = worker.slice(worker.indexOf("async function submitConsultation"));
  const verifyAt = submit.indexOf("verifyHumanPayload");
  const insertAt = submit.indexOf("INSERT INTO consultation_submissions");
  assert.ok(verifyAt > -1 && insertAt > -1, "expected both verification and the insert in submitConsultation");
  assert.ok(verifyAt < insertAt, "verification must run before the submission is written to the database");

  // The answer is bound to a signed, expiring token rather than trusted as sent.
  assert.match(consultation, /crypto\.subtle\.verify\("HMAC"/);
  assert.match(consultation, /Number\(data\.answer\) !== first \+ second/);
});

test("enforces signed, expiring, rate-limited same-origin verification", async () => {
  const worker = await read("worker/index.ts");
  assert.match(worker, /BOT_PROTECTION_SECRET/);
  assert.match(worker, /crypto\.subtle\.verify\("HMAC"/);
  assert.match(worker, /tokenAge > 10 \* 60_000/);
  assert.match(worker, /current\.count > 12/);
  assert.match(worker, /new URL\(origin\)\.host !== new URL\(request\.url\)\.host/);
  assert.match(worker, /"cache-control": "no-store, max-age=0"/);
});

test("keeps the Contact page free of an unprotected local form", async () => {
  const html = await read("public/contact.html");
  assert.doesNotMatch(html, /<form\b/i);
  assert.match(html, /href="book-consultation"/);
  assert.match(html, /server-verified human verification/);
});
