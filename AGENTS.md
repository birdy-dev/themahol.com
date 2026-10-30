Never use em dashes or en dashes in website copy. Use a standard hyphen (-) instead.

- prefer Tailwind CSS default tokens over custom
- Do not add comments unless absolutely necessary. Required comments explain why,
  never what the code does.
- use stripe cli `pnpm exec stripe` to manage stripe. You need to ask the user to login if they are not logged in yet.

## Linting and formatting

- After changing files, run `pnpm fmt` and `pnpm check` before finishing.
- For lint fixes, use `pnpm exec oxlint --fix --deny-warnings --format=agent .`, then rerun `pnpm fmt` and `pnpm check`.
- `pnpm check` runs formatting checks, lint, Astro type checking, and all tests.
  Use `pnpm fmt:check` for a formatting-only check without changing files.
- The shared hook runner is `.agents/hooks/agent_stop.mjs`. Run `pnpm fmt`
  and `pnpm check` manually whenever hooks are unavailable.

## First-time agent setup

- For a fresh checkout or first use by an agent client, read and follow
  `.agents/skills/onboarding/SKILL.md` before implementation.
- Set up only the current client. Its local, Git-ignored native config records
  that setup; do not repeat setup every turn.
- Keep repository agent configuration in `.agents` and this file. Do not commit
  `.codex`, `.claude`, `.cursor`, or `CLAUDE.md`.

## Toolchain

- Stay on Astro v6 with a TypeScript version supported by standard `astro check`.
- Avoid custom checker workspaces. Revisit v7 upgrades only when Astro's standard
  tooling supports them and the user requests the upgrade.

## Project documentation

- Start with [docs/index.md](docs/index.md) for coding style, architecture, and debugging.
- Follow the coding style guide before changing files. Keep the documentation index
  updated when adding or renaming guides.
