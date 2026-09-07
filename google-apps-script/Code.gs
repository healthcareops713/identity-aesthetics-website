const RECIPIENT = "info@713botoxme.com";

function doPost(event) {
  try {
    const envelope = JSON.parse(event.postData.contents || "{}");
    const payload = String(envelope.payload || "");
    const signature = String(envelope.signature || "");
    const secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
    if (!secret || !payload || !signature || !constantTimeEqual(signature, signPayload(payload, secret))) {
      return jsonResponse({ ok: false, error: "Unauthorized request." });
    }

    const data = JSON.parse(payload);
    const required = ["submissionId", "submittedAt", "name", "phone", "email", "interest", "careMode", "location", "contactPreference"];
    if (required.some(function (key) { return !data[key]; })) {
      return jsonResponse({ ok: false, error: "Incomplete request." });
    }

    const consent = data.marketingConsent
      ? "YES\nConsent version: " + data.smsConsentVersion + "\nClient timestamp: " + data.smsConsentClientTimestamp + "\nServer timestamp: " + data.smsConsentServerTimestamp + "\nSource URL: " + data.smsConsentSourceUrl + "\nDisclosure: " + data.smsConsentDisclosure
      : "NO — optional marketing text consent was not provided.";
    const fields = [
      ["Reference", data.submissionId], ["Submitted", data.submittedAt], ["Name", data.name],
      ["Mobile", data.phone], ["Email", data.email], ["Interest", data.interest],
      ["Care setting", data.careMode], ["Location", data.location], ["Provider", data.provider],
      ["Preferred response", data.contactPreference], ["Question or goal", data.notes],
      ["Source", data.source], ["Marketing text consent", consent],
      ["Request-contact disclosure", data.requestContactDisclosureVersion]
    ];
    const plain = fields.map(function (field) { return field[0] + ": " + field[1]; }).join("\n\n");
    const rows = fields.map(function (field) {
      return '<tr><th align="left" valign="top" style="border-bottom:1px solid #ddd;padding:8px">' + escapeHtml(field[0]) + '</th><td style="border-bottom:1px solid #ddd;padding:8px;white-space:pre-wrap">' + escapeHtml(String(field[1])) + "</td></tr>";
    }).join("");

    MailApp.sendEmail({
      to: RECIPIENT,
      replyTo: cleanHeader(data.email),
      name: "Identity Aesthetics Website",
      subject: "Consultation request — " + cleanHeader(data.name) + " — " + cleanHeader(data.interest),
      body: plain,
      htmlBody: "<h2>New Identity Aesthetics consultation request</h2><table cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse\">" + rows + "</table><p>This scheduling request may contain personal information. Handle it according to practice privacy procedures.</p>"
    });
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return jsonResponse({ ok: false, error: "Delivery failed." });
  }
}

function signPayload(payload, secret) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, secret)).replace(/=+$/, "");
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function cleanHeader(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim().slice(0, 254);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
  });
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
