# Debugging

## Reproduce locally

From the repository root, run the commands below and open the URL printed by Astro, usually `http://localhost:4321`. Follow the README's Stripe setup first: local `.env` holds the test key and five test Price IDs, and Cloudflare loads `.env` directly. An older `.dev.vars` takes precedence, so keep only one source of credentials. Restart the dev server after changing credentials. If the port is occupied, Astro may choose another one; use the printed URL.

```sh
pnpm install
pnpm dev
```

Use the browser's developer tools: **Console** shows browser errors, and **Network** shows the request to `/api/checkout/`. Record the pass/class, response status, time, and whether it fails locally or only in the preview. The terminal running `pnpm dev` shows server activity. Before sharing a fix, run `pnpm fmt`, `pnpm check`, and `pnpm build`.

## Test with Stripe

Use the matching Mahol test account and test Price IDs. In hosted Checkout, use `4242 4242 4242 4242`, a future expiry, and any three-digit CVC; see [Stripe's test scenarios](https://docs.stripe.com/testing) for declines. Check all five passes, class selection and clearing, cancellation, and the successful return page. Subscriptions should renew monthly or every three months; both-class passes should save `class=both`.

```sh
pnpm exec stripe login
pnpm exec stripe whoami --format json
pnpm exec stripe logs tail
```

Confirm `whoami` reports the correct account and `mode: test` before inspecting test data. CLI login does not supply the application's `STRIPE_SECRET_KEY`. In Stripe's Dashboard, use test mode and inspect request logs plus the Checkout Session, payment, or subscription; metadata should include `mahol_pass`, `class`, and `class_name`. A completed payment must have paid status before our success page confirms it. There is currently no webhook route, so `stripe listen` and webhook forwarding are not needed.

## Interpret checkout failures

| Symptom                      | First thing to check                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Disabled single-class button | Choose Beginner or Intermediate-Advanced; clearing it disables checkout again.                                                                               |
| HTTP 400                     | Invalid pass, missing class, malformed JSON, or missing request ID. Inspect the browser request.                                                             |
| HTTP 403                     | The request must originate from the same site. Open the page and use its button.                                                                             |
| HTTP 503                     | Missing/wrong key or Price, inactive Price, incorrect CAD amount/interval, or Stripe/network failure. Compare configuration with `src/data/dance_passes.ts`. |
| Payment not confirmed        | Verify the Session in Stripe. A missing, unpaid, or invalid Session cannot show success; a temporary Stripe error also gives this message.                   |

Checkout returns a generic 503 in the browser. Server logs include the configuration error or Stripe HTTP status and request ID, without API keys or customer details. Use that request ID to find the underlying error in Stripe request logs. If no request reaches Stripe, check local configuration or the preview's secret and `STRIPE_MODE` first. Never paste API keys, card data, or full customer records into logs or bug reports.

## Cloudflare preview and logs

Use the [branch preview](https://codex-astro-preview-mahol-website.birdy.workers.dev/classes/) for hosted reproduction. In Cloudflare, open **Workers & Pages > mahol-website**, select the relevant Preview, then its **Observability** view. Check that logging is enabled for that preview if no entries appear. Match the request time, URL, and response status; caught checkout failures may only show a 503, so also check Stripe. See [Cloudflare's preview debugging guide](https://developers.cloudflare.com/workers/previews/test-and-debug/).

```sh
pnpm exec wrangler whoami
pnpm exec wrangler login
pnpm exec wrangler preview secret list
pnpm deploy:preview
```

`login` is needed only when authentication fails; complete the browser's **Allow** step. `secret list` shows secret names, not their values, and defaults to the current branch's Preview. Deploy again after changing code or preview variables. For a deployed production Worker, `pnpm exec wrangler tail mahol-website` streams live logs; Wrangler tail currently cannot target branch Previews, so use their Observability view. Do not run `pnpm deploy:production` just to debug a preview.

## Git and sharing a reproduction

Run `git status` to see changed files and `git branch --show-current` to identify your branch. Include the commit ID from `git rev-parse --short HEAD`, the local/preview URL, exact steps, and a redacted error when asking for help. If commits stall at signing, approve the 1Password/SSH signing prompt; keep signing enabled. Check that `.env` and `.dev.vars` stay ignored before committing.

## Automatic deployment failures

Open the repository's **Actions** tab and select the failed **Deploy to Cloudflare**
run (or **Deploy preview** for manual branch deployments). For a preview, confirm
the selected branch and look for its URL in the deployment step. The manual
workflow must exist on the default branch before GitHub shows **Run workflow**.
Installation/check failures should reproduce with `pnpm install --frozen-lockfile`
and `pnpm check`. An authentication failure at deployment usually means the
`CLOUDFLARE_API_TOKEN` Actions secret is missing/expired or its account access does
not match the `CLOUDFLARE_ACCOUNT_ID` Actions variable. Local `wrangler login` does
not authenticate GitHub Actions. Production deployment applies the `themahol.com`
Custom Domain declared in `wrangler.jsonc`; domain setup failures can indicate an
inactive zone, insufficient token permissions, or a conflicting existing CNAME
or Pages domain association. A production deployment does not update a branch Preview.
