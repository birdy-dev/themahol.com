---
name: onboarding
description: Set up this repository for a coding agent's first use, including pnpm-managed Node.js and local formatting/lint hooks. Use for a fresh checkout, a new agent client, or an explicit setup repair.
---

# Repository onboarding

Read the root `AGENTS.md` first. Keep shared agent instructions and executable
hook logic in `.agents` and `AGENTS.md`. Native client configuration is generated
locally and ignored by Git; do not add it to version control.

## First setup

1. From the Git root, run `pnpm install --frozen-lockfile` if dependencies are
   missing. pnpm installs the Node.js version declared in `package.json`.
2. Identify the client hosting the session: `codex`, `claude`, or `cursor`. Do not
   guess from the model name. For a different client, follow the manual checks in
   `AGENTS.md`; add another adapter only when requested.
3. Run the setup helper for that client only:

   ```sh
   pnpm exec node .agents/skills/onboarding/scripts/setup.mjs --agent codex
   ```

   Substitute `claude` or `cursor` as appropriate. The helper preserves unrelated
   client settings, installs main-agent and subagent completion hooks, and is safe
   to rerun. Its output says whether the local config changed. If the current
   client already has the shared hook configured, skip this step.

4. Follow the client's normal activation requirements. Codex requires reviewing
   and trusting new/changed hooks through `/hooks` in the CLI. Claude Code requires
   workspace trust; inspect its `/hooks` menu. Cursor uses workspace trust and its
   Hooks settings/output channel. Do not change trust settings programmatically.
   Cursor should use its native hooks without also importing Claude's hooks.
5. Run `pnpm fmt` and `pnpm check`. Report any activation step still requiring
   the user. Continue useful work and run checks manually while hooks are inactive.

## Subsequent work

Do not repeat installation or setup on every turn. The local client config is the
setup state. Rerun the helper only when it is absent, the shared hook is missing,
or a hook setup change requires refreshing it. Hooks run Oxfmt then Oxlint through
`.agents/hooks/agent_stop.mjs`; they request at most one automatic repair retry.

The supported native discovery paths are `.codex/hooks.json`,
`.claude/settings.json`, and `.cursor/hooks.json`. These directories may exist
locally after onboarding, but the repository's shared configuration stays in
`.agents`. Do not create `CLAUDE.md` or duplicate `AGENTS.md`.
