# Developer onboarding

Take one small, real change from your computer to production. A copy fix or a
small accessibility improvement makes a good first contribution.

## Your first contribution

- [ ] **Clone the repository.** Follow the [setup guide](../README.md#get-started-contribution).
      Confirm you can access the repo and find the README. Read the
      [coding style](coding_style.md) and skim the [architecture](architecture.md)
      to find where pages, components, and styles live.
- [ ] **Run the site locally.** Install dependencies, run `pnpm setup:env`, and
      start `pnpm dev` using the setup guide. Confirm you can browse the site. Stripe
      credentials are only needed for payment testing; ask another maintainer for the
      test configuration if your change needs it.
- [ ] **Create a branch and commit your first change.** Create a branch such as
      `git switch -c your-name/onboarding` before editing. Make your small change
      and verify it in the browser. Run `pnpm fmt`, `pnpm check`, and `pnpm build`,
      then stage the intended files and commit with a semantic message such as
      `fix: clarify class signup copy`.
- [ ] **Push your branch.** Run `git push -u origin onboarding/your-name`, using
      your branch name. Find your branch and commit on GitHub, Pushing shares your
      work without merging it.
- [ ] **Deploy and test a preview.** Follow the
      [preview deployment guide](../README.md#cloudflare-deployment) to run
      **Actions > Deploy preview > Run workflow** for your branch. Preview
      deployment is manual, so a push or pull request alone does not create one.
      Open the preview URL from the deployment logs, test your change, and add
      the URL and your test results to the issue. Use Stripe test mode if testing
      payments. Ask another maintainer to run the workflow if you don't have access.
- [ ] **Open your first pull request.** Target `main`, follow the
      [pull request template](../.github/pull_request_template.md), and use a
      semantic title. Link your onboarding issue and preview, explain what
      changed, and describe your testing. Request a review and respond
      to feedback. CI workflows runs `pnpm check` and `pnpm build` when the pull request is
      opened and whenever you push more commits. Deploy the preview again after
      changes so reviewers can test the latest version.
- [ ] **Merge your first pull request.** Complete review and wait for required
      checks to pass, then squash merge with your buddy's help if needed. Verify
      your change is on `main` and add the pull request link to your issue. CI
      runs again on the resulting squash commit. Merging does not deploy production.
- [ ] **Publish your first production release.** Wait for CI on
      `main` to pass, then follow the [release guide](../README.md#release-a-version).
      Choose a new `vMAJOR.MINOR.PATCH` tag targeting the intended commit on `main`
      and publish a stable GitHub release. Publishing the release triggers
      production deployment; creating or pushing a tag alone does not. Wait for
      **Deploy to Cloudflare** to succeed, verify your change on the live site,
      and add the release link and verification results to your issue.

If you get stuck, record the step, what you tried, and any error message in your
issue. Keep credentials out of issues and chat.
The [debugging guide](debug.md) covers common local and deployment problems.
