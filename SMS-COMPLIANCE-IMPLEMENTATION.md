# Identity Aesthetics SMS Compliance Launch Checklist

Prepared August 6, 2026. This implementation guide supports operational readiness; it is not legal advice and does not guarantee regulator, carrier or platform approval. Have qualified counsel confirm the final campaign, especially state-specific requirements in every state where a recipient is located.

## Do not launch promotional blasts until all gates pass

1. Register the sending number and the Identity Aesthetics brand/campaign through the messaging provider's A2P 10DLC or applicable toll-free verification process. The registered legal name, EIN, website, campaign description, sample messages and opt-in flow must match.
2. Keep the website's optional `marketing_consent` checkbox mapped to its dedicated consent record. Never treat a phone number, appointment request, past purchase, patient relationship or agreement to general terms as marketing consent.
3. Store defensible consent evidence: mobile number; checkbox state; UTC client and server timestamps; source URL/form; disclosure version `IA-SMS-2026-08-06`; exact disclosure snapshot; campaign/purpose; and any later revocation or re-consent. The secure consultation endpoint records the current website evidence.
4. Keep marketing consent separate from appointment/service messages in every future messaging platform. Use distinct fields, lists and workflows. A person may opt into one category and not the other.
5. Configure STOP, QUIT, END, REVOKE, OPT OUT, CANCEL and UNSUBSCRIBE, plus staff handling for any other reasonable stop request received by text, phone, voicemail or email. Apply a master suppression/DND state across every connected provider. Never make staff wait for clarification before honoring a broad request.
6. Configure HELP to identify Identity Aesthetics and provide 713-BOTOX-ME and/or info@713botoxme.com. Permit only one non-promotional opt-out confirmation.
7. Use immediate suppression as the operating standard. The federal outside limit for many revocations is 10 business days; certain healthcare-message rules require immediate handling.
8. Scrub applicable campaigns against the National Do Not Call Registry at least every 31 days unless counsel confirms a valid exception or permission for that campaign. Maintain an internal company-specific do-not-contact list indefinitely and written procedures, staff training and vendor monitoring.
9. Use recipient-local quiet hours. The federal window is 8 a.m.–9 p.m.; use 8 a.m.–8 p.m. recipient local time as the safer default until counsel confirms all applicable state limits.
10. Do not buy, rent, append or upload third-party lead lists. Consent belongs to the person, seller and disclosed campaign; it is not transferable.
11. Obtain any required HIPAA business associate agreements and complete a security/risk review for every messaging, hosting and email vendor before PHI is involved. Promotional lists should not expose or imply diagnoses, prescriptions, treatments, lab results or patient status.
12. Keep records of every campaign, audience query, suppression check, message template, send time, sender number, delivery result, opt-out and complaint. North Carolina expressly treats promotional text communications as telephone solicitations and has state recordkeeping and do-not-call rules.

## State-specific launch checks

- **Texas:** Chapters 302 and 304 now expressly reach promotional text and media messages. The Texas Secretary of State currently states that, because of the State's position in pending litigation and an agreement among the parties, a business sending texts with the consumer's prior consent is not required to file the Chapter 302 telephone-solicitation registration statement. Treat that FAQ as time-sensitive: have counsel re-check it immediately before launch and never send Texas promotions without documented prior consent. Also evaluate the Texas no-call rules.
- **North Carolina:** Article 4 of Chapter 75 defines telephone solicitation to include voice or text communications. It requires do-not-call controls, written systems and procedures, personnel training and monitoring, 8 a.m.–9 p.m. calling hours, and specified records. Use the stricter immediate suppression and 8 a.m.–8 p.m. operational defaults in this checklist.
- **South Carolina:** Title 37, Chapter 21 expressly covers text and media messages used to advertise goods or services. It restricts solicitation hours to 8 a.m.–9 p.m. at the consumer's location, requires sender disclosures and an internal do-not-call process, and applies the National Do Not Call framework. Use the stricter operational defaults in this checklist.
- **Recipient location controls:** A mobile number may not identify where the recipient is physically located. Before expanding campaigns beyond known Texas, North Carolina and South Carolina contacts, obtain counsel's review of the recipient-state rules and configure location-aware quiet hours and suppression.

## Required messaging-platform fields

- `SMS Marketing Consent` — checkbox/boolean, never defaulted on
- `SMS Consent Timestamp` — date/time
- `SMS Consent Source URL` — text
- `SMS Consent Disclosure Version` — text
- `SMS Consent Method` — website checkbox, written authorization, keyword, or other approved method
- `SMS Consent Campaign` — `Identity Aesthetics Marketing`
- `SMS Opt-Out Timestamp` — date/time
- `SMS Opt-Out Method` — keyword, text phrase, call, voicemail, email, staff entry
- `SMS Compliance Hold` — boolean/master suppression

## Workflow safeguards

- Entry rule: `SMS Marketing Consent = Yes` AND `SMS Compliance Hold != Yes` AND campaign-specific consent is current.
- Exit rule: any opt-out immediately removes the contact from every promotional workflow and sets the compliance hold.
- Never let a workflow re-enable messaging solely because a contact books, submits another form or changes pipeline stage.
- Re-enrollment after opt-out requires a fresh affirmative opt-in with new evidence.
- Test with internal numbers before launch: unchecked form, checked form, STOP, a natural-language request such as “please don’t text me,” HELP, duplicate contact, resubmission and re-opt-in.

## Sample messages

**Welcome:** `Identity Aesthetics: You’re enrolled in recurring marketing texts. Frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help.`

**Promotion:** `Identity Aesthetics: [clear offer and material terms]. Book: [brand-controlled URL]. Msg frequency varies; msg & data rates may apply. Reply STOP to opt out.`

**HELP:** `Identity Aesthetics: For help, call 713-268-6963 or email info@713botoxme.com. Msg & data rates may apply. Reply STOP to opt out.`

**Opt-out confirmation:** `Identity Aesthetics: You have been unsubscribed and will receive no further marketing texts. No reply is needed.`

## Launch approval record

Before the first campaign, document the responsible owner, legal review date, provider registration status, sending number, campaign ID, privacy/SMS terms URLs, consent-form screenshot, test results, staff training date and final approval date.
