# Google Workspace email setup

The consultation endpoint sends signed requests to a private Google Apps Script web app owned by the Identity Aesthetics Workspace account. The script emails `info@713botoxme.com`. It does not store a Google password, service-account key, or domain-wide delegation grant.

## One-time administrator setup

1. Create an Apps Script project under the designated Identity Aesthetics Workspace account.
2. Add `google-apps-script/Code.gs` to the project.
3. In **Project Settings → Script Properties**, add `WEBHOOK_SECRET` with a long random value.
4. Deploy the project as a web app that executes as the project owner and permits access to the webhook URL. The HMAC signature prevents unsigned submissions from being emailed.
5. Configure the website's protected production variables:

   - `GOOGLE_MAIL_WEBHOOK_URL`: the deployed Apps Script web-app URL
   - `GOOGLE_MAIL_WEBHOOK_SECRET`: the same random value stored in Script Properties

After the variables are configured, submit one test request without marketing consent and one with it. Confirm both emails arrive and that each request appears in the consent database with the expected consent state.

## Security maintenance

- Restrict who can edit the Apps Script project and website production variables.
- Keep `WEBHOOK_SECRET` only in Apps Script properties and protected website configuration.
- Rotate the secret if it may have been exposed.
- Review Apps Script executions for unexpected failures or volume.

Google references:

- Apps Script web apps: https://developers.google.com/apps-script/guides/web
- Script properties: https://developers.google.com/apps-script/guides/properties
- Mail service: https://developers.google.com/apps-script/reference/mail/mail-app
