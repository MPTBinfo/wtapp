# Water Tourism Permission Application — MP Tourism Board

Next.js App Router application for preparing a Madhya Pradesh water-tourism permission application, calculating the legacy application fee estimate, and downloading a PDF copy.

## Features

- Applicant and contact details
- Waterbody selection from the application's existing 22-entry list
- Water-tourism activity selection and quantity fields
- Fee estimate based on the current source-code rule of ₹2,360 per selected activity unit
- Demand Draft and UPI payment-reference fields
- Client-generated application PDF with MP Tourism Board branding
- Google Apps Script submission request

## Local development

Requirements: Node.js 20+ and pnpm 9+.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

To create a production build:

```bash
pnpm build
pnpm start
```

## Important operational notes

1. **Submission receipt is not verified by the browser.** The current client uses a cross-origin Google Apps Script endpoint with `mode: "no-cors"`. That produces an opaque response, so the app cannot confirm that the server stored the application or sent a notification. The UI must not describe that as a confirmed submission.
2. **Fee schedule requires official verification.** ₹2,360 per activity unit is the rule currently present in this app's source, not a guarantee that it is the currently approved government fee schedule. Verify before using for official demand/payment.
3. **Sensitive information:** PAN, Aadhaar/GSTN and payment references are collected in the browser and some fields are sent to the configured Apps Script endpoint. Before production use, review the endpoint's access controls, data retention, sharing settings, and applicable privacy requirements. Never add service credentials or private keys to client code.
4. **Security maintenance:** this repository currently specifies Next.js 14.2.16. Review a tested upgrade to a currently patched, supported Next.js release before production deployment. A major-version upgrade should be accompanied by lockfile regeneration and build testing.
5. This is an application-preparation tool; it does not itself grant a statutory permission.

## Environment and integrations

The Apps Script URL is currently hard-coded in `app/page.tsx`. Move it to a validated public environment variable (for example `NEXT_PUBLIC_APPLICATION_SUBMISSION_URL`) after verifying the endpoint and deployment environment. A public URL is not a secret; privileged credentials must remain server-side.

## Known maintenance items

- The checked-in `pnpm-lock.yaml` is currently only a stub and does not pin dependency versions. Regenerate and commit a complete lockfile before release.
- Add an integration test that verifies the Apps Script endpoint's expected payload and a verifiable receipt/status response before representing an application as submitted.
- Review required-field validation for the custom Radix Select component and the combined Aadhaar/GSTN field.