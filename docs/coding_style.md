# Coding style

## File and directory names

Use lowercase names with underscores between words for files and directories:
`class_selector.astro`, `dance_passes.ts`, and `setup_env.test.mjs`. Keep normal
extension separators, including compound extensions such as `.test.mjs` and
`.d.ts`. Component identifiers in code can still use PascalCase; their filenames
use lowercase and underscores. Apply this convention when adding or renaming files,
and update imports, asset URLs, documentation, and scripts together.

Preserve exact names required for tool discovery, such as `README.md`, `AGENTS.md`, `SKILL.md`,
`package.json`, `pnpm-lock.yaml`,
and `pnpm-workspace.yaml`. Preserve established public URL routes such as
`src/pages/events/ghungroo-3.astro`; avoid changing a published route just to change
its filename. Tool-managed/generated files retain required names. Documentation filenames also
use lowercase and underscores.

## Commits and pull requests

Use semantic commits for commit messages and pull request titles. Write them as
`type: description`, for example `feat: add dance pass checkout`. Use a short,
imperative description and a type that matches the change, such as `feat`, `fix`,
`docs`, `refactor`, `test`, or `chore`.

Use the [pull request template](../.github/pull_request_template.md) to describe
the problem, resulting behavior, and validation performed.

## Comments

Do not add comments unless they are absolutely necessary. When one is required,
explain **why** the code uses that approach, constraint, or tradeoff, never what
it does. Prefer clear names and straightforward code; put general explanations
and setup instructions in documentation.

## Portable code and checks

Use Node.js APIs for repository automation so it runs on macOS, Windows, and Linux.
Avoid shell-specific syntax, platform utilities, and symlink requirements. Run
Node.js through pnpm so scripts use the project's pinned runtime. Prefer Tailwind's
default tokens for styling and use a standard hyphen in website copy.

Run `pnpm fmt` to format changes, then `pnpm check` for formatting checks, lint,
Astro/TypeScript, and all tests. Run `pnpm build` when changes affect the app or its
build. See [Architecture](architecture.md) for where code belongs and
[Debugging](debug.md) for troubleshooting.
