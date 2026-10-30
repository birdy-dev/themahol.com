import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const input = readFileSync(0, "utf8").trim();
const event = input ? JSON.parse(input) : {};
const failures = [];
const isCursor =
  process.argv.includes("--agent=cursor") ||
  ["stop", "subagentStop"].includes(event.hook_event_name);

// Agent clients parse stdout as JSON, so tool output must stay captured.
for (const task of [event.permission_mode === "plan" ? "fmt:check" : "fmt", "lint"]) {
  const tool = task === "lint" ? "oxlint" : "oxfmt";
  const arguments_ =
    task === "lint"
      ? ["--deny-warnings", "--format=agent", "."]
      : [task === "fmt:check" ? "--check" : "--write", "."];
  const result = spawnSync(
    process.execPath,
    [join(root, "node_modules", tool, "bin", tool), ...arguments_],
    {
      cwd: root,
      encoding: "utf8",
      timeout: 45_000,
      maxBuffer: 1024 * 1024,
    },
  );
  if (result.status !== 0) {
    const output = [result.error?.message, result.stdout, result.stderr].filter(Boolean).join("\n");
    const command = task === "lint" ? "pnpm exec oxlint" : `pnpm ${task}`;
    failures.push(`${command} failed:\n${output.slice(-6000)}`);
  }
}

if (failures.length === 0) {
  console.log("{}");
} else {
  const reason = `End-of-turn formatting/lint checks failed. Fix the reported issues and rerun pnpm fmt and pnpm check before finishing.\n\n${failures.join("\n\n")}`;
  // Repeated blocking can otherwise trap the agent in an endless continuation loop.
  if (isCursor) {
    const retry = event.status === "completed" && (event.loop_count ?? 0) < 1;
    if (!retry) console.error(reason);
    console.log(JSON.stringify(retry ? { followup_message: reason } : {}));
  } else {
    console.log(
      JSON.stringify(
        event.stop_hook_active ? { systemMessage: reason } : { decision: "block", reason },
      ),
    );
  }
}
