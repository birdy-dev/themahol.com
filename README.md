# Mahol Website

Astro v6 + TypeScript v6 + Tailwind CSS, using pnpm and deployed to Cloudflare Workers.
`pnpm check` runs formatting checks, lint, standard `astro check`, and all tests.
The public pages are pre-rendered. Checkout creation and payment confirmation run
on the Cloudflare Worker and call Stripe directly.

## Documentation

- [Coding style](docs/coding_style.md): naming conventions, portable scripts, and checks.

- [Architecture](docs/architecture.md): app flow, Stripe, Cloudflare, domains, and the technology stack.
- [Debugging](docs/debug.md): local reproduction, test payments, and hosted logs.

## Get Started Contribution

### 1. Install pnpm

Start with the [official pnpm installation guide](https://pnpm.io/installation)
and choose the **standalone installation** option for your operating system.
Standalone pnpm 12 runs without a separate Node.js installation. Finish the
installer, open a new terminal, and check that pnpm is available:

```sh
pnpm --version
```

The project pins pnpm in `package.json`. After cloning, `pnpm install` downloads
and manages the project's pinned Node.js version as well as its dependencies.
Use `pnpm exec node` whenever you need to run Node.js directly for this project.

### 2. Install Git

Install [Git](https://git-scm.com/downloads) to download the repository and track
changes. Choose the instructions for your operating system, then open a new
terminal and verify the installation:

```sh
git --version
```

### 3. Clone the repository

In the folder where you keep projects, download a working copy and enter it:

```sh
git clone https://github.com/birdy-dev/themahol.com.git
cd themahol.com
```

### 4. Install project dependencies

```sh
pnpm install
```

pnpm installs the dependencies recorded in `pnpm-lock.yaml` and downloads the
Node.js version pinned in `package.json`. Run project commands through pnpm to use
that version; bare `node` still uses your shell's Node.js.

### 5. Create local configuration

```sh
pnpm setup:env
```

This portable Node.js helper creates `.env` from `.env.example` and keeps an
existing `.env` unchanged. You can browse the site without Stripe credentials.
To test payments, open `.env` in your editor and fill in the test key and five
matching test Price IDs described under [Stripe configuration](#stripe-configuration).
Ask a maintainer which Stripe test account and Prices to use. Keep credentials
out of Git and never paste them into public issues.

### 6. Start the app

```sh
pnpm dev
```

Open the URL printed in the terminal, usually `http://localhost:4321`. Edits to
pages update the browser automatically. Keep this terminal running; press
**Ctrl+C** to stop it. Restart it after changing `.env`. Cloudflare loads `.env`
directly, so no copy or link to `.dev.vars` is needed. If an older checkout has
`.dev.vars`, it takes precedence: preserve its credentials and migrate them into
`.env` before removing that older file or link through your file manager.

### 7. Check your changes

```sh
pnpm fmt
pnpm check
pnpm build
```

`pnpm fmt` formats files; `pnpm fmt:check` checks formatting without changing them.
`pnpm check` checks formatting, lint, Astro/TypeScript, and all tests.
`pnpm build` verifies the production build. They do not deploy the site or charge a card. See
[Debugging](docs/debug.md) for failed commands. When updating dependencies, commit
`package.json` and `pnpm-lock.yaml` together so teammates get the same versions.

## Stripe CLI

The official `@stripe/cli` package is a project dev dependency. `pnpm install`
installs it for the current platform; no global Stripe CLI installation is needed.

```sh
pnpm exec stripe --version
pnpm exec stripe login
```

CLI login is separate from the application's `STRIPE_SECRET_KEY` configuration.

## Stripe configuration

Run `pnpm setup:env`, then edit the generated `.env` in your editor. Cloudflare
reads it directly on macOS, Windows, and Linux. `.env` and any older `.dev.vars`
files are ignored by Git; `.env.example` contains only names and comments.

Set `STRIPE_SECRET_KEY` from the [Stripe API keys page](https://dashboard.stripe.com/apikeys).
Use a one-time drop-in Price and four recurring Stripe Prices and put their `price_...` IDs in the matching
variables, using the same Stripe account and sandbox/live mode as the secret key.
Live Price IDs cannot be used with a test key:

| Variable                           | Pass         | Billing (CAD)       |
| ---------------------------------- | ------------ | ------------------- |
| `STRIPE_PRICE_DROP_IN`             | Drop-in      | $25 once            |
| `STRIPE_PRICE_SINGLE_MONTH`        | Single class | $80 per month       |
| `STRIPE_PRICE_SINGLE_THREE_MONTHS` | Single class | $180 every 3 months |
| `STRIPE_PRICE_BOTH_MONTH`          | Both classes | $100 per month      |
| `STRIPE_PRICE_BOTH_THREE_MONTHS`   | Both classes | $260 every 3 months |

A publishable browser key is not needed for the redirect to Stripe-hosted Checkout.

For deployment, configure `STRIPE_SECRET_KEY` as a Cloudflare Worker secret:

```sh
pnpm exec wrangler secret put STRIPE_SECRET_KEY
```

The five live Price IDs and `STRIPE_MODE=live` are committed under top-level `vars`
in `wrangler.jsonc`. Test Price IDs and `STRIPE_MODE=test` are under `previews.vars`.
Update Price IDs in that file rather than the dashboard so deployments preserve them.
Use test credentials for previews and live credentials only for production.
Runtime secrets belong in Cloudflare, not the repository or public client code.
Production rejects test keys, and previews reject live keys. Local development
must set `STRIPE_MODE=test` in `.env` along with its test key and test Price IDs;
add this setting to existing `.env` files created before it was in `.env.example`.

The dance page opens Stripe-hosted Checkout. Drop-ins use payment mode; the other
four passes use subscriptions. The server validates the selected pass and class,
checks the configured CAD Price, and attaches class metadata to both the Checkout
Session and the resulting PaymentIntent or Subscription. Prices come from server
configuration, never the browser. Billing starts immediately with no future start
or calendar-month anchor.

The success page retrieves the Session from Stripe and requires a completed, paid
session before confirming payment. There is no attendance tracking or webhook
fulfillment. Teachers can inspect the payment/subscription and class metadata in
Stripe. Subscription renewals and failed payments remain managed in Stripe.

Run `pnpm check` to include checkout validation tests. For local sandbox testing,
use Stripe's test card `4242 4242 4242 4242`, a future expiry, and any three-digit
CVC. Never use real card details in test mode. Restart `pnpm dev` after changing
local credentials. `pnpm check` generates Cloudflare types in ignored `worker_configuration.d.ts`.

References: [Cloudflare local environment variables](https://developers.cloudflare.com/workers/local-development/environment-variables/)
and [Stripe API keys](https://docs.stripe.com/keys).

## Cloudflare deployment

To deploy a preview from GitHub, merge [the preview workflow](.github/workflows/deploy_preview.yml)
into the default branch first, then:

1. Open the repository's **Actions** tab and select **Deploy preview**.
2. Click **Run workflow**, then select the branch in the **Branch** dropdown.
3. Click **Run workflow** to run checks, build, and deploy that branch's preview.
4. Open the preview URL printed in the deployment step's logs.

This workflow runs only when manually requested; pushes and pull requests do not
trigger it. The selected branch is checked out by name, so Wrangler uses that
branch as the Preview name. Tag refs are skipped.

Deploy the current Git branch to an isolated Cloudflare Worker Preview:

```sh
pnpm exec wrangler login
pnpm deploy:preview
```

Wrangler prints the preview URL. This command does not change production or DNS.
The preview configuration uses the five Stripe test Price IDs in `wrangler.jsonc`
and rejects live API keys with `STRIPE_MODE=test`.
After adding a test key to local `.env`, upload it to the matching Preview with
`pnpm exec wrangler preview secret put STRIPE_SECRET_KEY` (provide the key through the secure
prompt). Set `pnpm exec wrangler preview base-config secret put STRIPE_SECRET_KEY`
once so new branch previews inherit the test key. Existing previews need their
own secret update. Never commit the key or upload `.env.live` to a preview.

### Release a version

Once [the deployment workflow](.github/workflows/deploy.yml) is merged, developers
release production by publishing a GitHub release. Merge the desired changes to
`main`, then use the repository's website:

1. Open **Releases > Draft a new release**.
2. Under **Choose a tag**, enter a new version such as `v1.2.3` and select
   **Create new tag**.
3. Set **Target** to `main`.
4. Add a title and release notes, or use **Generate release notes**.
5. Leave **Set as a pre-release** unchecked and click **Publish release**.

Choose a new version for each release. Tags must use `vMAJOR.MINOR.PATCH`, such as
`v1.2.3`; invalid version tags fail validation, and releases marked as prereleases
are skipped. Saving a draft, pushing a tag alone, and editing release notes do not
deploy production. You can also publish a release for an existing tag through
GitHub or the GitHub CLI; publishing is the deployment trigger.
The tag must point to a commit containing the updated workflow. GitHub Actions
runs `pnpm check`, builds, and deploys that exact commit to the production
`mahol-website` Worker. Failed checks prevent deployment. Pushes to `main` do not
deploy production, and branch previews retain their manual workflow.

The workflow uses the GitHub `production` environment, which automatically
records deployment status and history. View runs in **Actions > Deploy to Cloudflare**
and deployments under the repository's **Deployments** section. GitHub tracks the
release; Cloudflare continues to host the website. See
[GitHub's deployment documentation](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments).

To retry a failed release, rerun its workflow in Actions. To roll back, publish a
new release with a new version tag pointing to a known good commit containing this workflow. Keep
published tags unchanged. Deployments run one at a time; this does not enforce
version order, so publish one release at a time and wait for it to finish.

`pnpm deploy:production` remains available for local deployments. It runs checks,
builds, and publishes production directly, without GitHub deployment tracking.

### GitHub configuration

In **Settings > Environments**, create `production` and configure its deployment
branch and tag rules to allow release tags matching `v*`. Leave required reviewers
disabled if publishing a release should be sufficient to deploy. Consider a tag
ruleset for `v*` to limit release creation to your release team and prevent tag
updates or deletion.

One-time GitHub setup: set the repository or organization Actions variable `CLOUDFLARE_ACCOUNT_ID`
to the Birdy account ID, and add the Actions secret `CLOUDFLARE_API_TOKEN` using a
Cloudflare **Edit Cloudflare Workers** token scoped to that account. Organization
settings must grant this repository access. Both workflows use these settings. See
[Cloudflare's GitHub Actions guide](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).
The CI token authenticates deployment; Stripe secrets belong on the Worker and
are not copied from local `.env`. Production Price IDs are in `wrangler.jsonc`;
the live `STRIPE_SECRET_KEY` must be configured on the production Worker before
accepting payments. For the first deployment, `wrangler secret put` can create
the Worker when prompted if it does not yet exist.

`wrangler.jsonc` declares `themahol.com` as a Worker Custom Domain. Publishing
`v1.0.0` deploys the Worker and applies that domain configuration, so no earlier
release is needed to configure the domain. Before publishing, confirm that
`themahol.com` is an active Cloudflare zone in the deployment account and that the
CI token can manage its custom domain. If the hostname has an existing CNAME or
is attached to the old Pages project, remove the conflicting association at
cutover, then deploy. Cloudflare provisions the Custom Domain DNS record and TLS
certificate. This configuration covers the apex domain only; `www.themahol.com`
needs its own redirect or domain configuration. See
[Cloudflare Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
and workflow progress in the repository's **Actions** tab.

## Agent onboarding

Shared agent configuration lives in `.agents` and `AGENTS.md`. On first use, agents
follow `.agents/skills/onboarding/SKILL.md` to install dependencies and configure
formatting/lint hooks for their current client. The helper preserves unrelated
client settings and can safely be rerun.

Client-native configuration is generated locally and ignored by Git. No native
agent directories or `CLAUDE.md` are kept in the repository. Normal client trust
requirements still apply; agents run `pnpm fmt` and `pnpm check` manually until
hooks are active. Subsequent turns reuse the local setup.

`pnpm check` also tests onboarding and the shared stop-hook behavior.
