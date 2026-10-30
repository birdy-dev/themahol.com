import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
  mkdirSync,
  realpathSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { setupAgentHooks } from "../.agents/skills/onboarding/scripts/setup.mjs";

const hook = new URL("../.agents/hooks/agent_stop.mjs", import.meta.url);

function runHook(event, fail = "", agent = "codex") {
  const dir = mkdtempSync(join(tmpdir(), "mahol-hook-"));
  const calls = join(dir, "calls");
  const workingDirectory = join(dir, "cwd");
  try {
    const runner = join(dir, ".agents", "hooks", "agent_stop.mjs");
    mkdirSync(join(dir, ".agents", "hooks"), { recursive: true });
    writeFileSync(runner, readFileSync(hook, "utf8"));
    for (const tool of ["oxfmt", "oxlint"]) {
      const bin = join(dir, "node_modules", tool, "bin");
      mkdirSync(bin, { recursive: true });
      writeFileSync(
        join(bin, tool),
        `
const fs = require("node:fs");
const task = process.argv.includes("--deny-warnings") ? "lint" : process.argv.includes("--check") ? "fmt:check" : "fmt";
fs.appendFileSync(process.env.HOOK_TEST_CALLS, task + "\\n");
fs.writeFileSync(process.env.HOOK_TEST_CWD, process.cwd());
if (task === process.env.HOOK_TEST_FAIL) {
  console.error("fixture lint/format failure");
  process.exit(1);
}
`,
      );
    }
    const result = spawnSync(process.execPath, [runner, `--agent=${agent}`], {
      input: JSON.stringify(event),
      encoding: "utf8",
      cwd: tmpdir(),
      env: {
        ...process.env,
        HOOK_TEST_CALLS: calls,
        HOOK_TEST_CWD: workingDirectory,
        HOOK_TEST_FAIL: fail,
      },
    });
    assert.equal(result.status, 0, result.stderr);
    return {
      root: realpathSync(dir),
      output: JSON.parse(result.stdout),
      stderr: result.stderr,
      cwd: readFileSync(workingDirectory, "utf8").trim(),
      calls: readFileSync(calls, "utf8").trim().split("\n"),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("formats before linting and returns valid success JSON", () => {
  const result = runHook({ hook_event_name: "Stop" });
  assert.deepEqual(result.calls, ["fmt", "lint"]);
  assert.equal(resolve(result.cwd), resolve(result.root));
  assert.deepEqual(result.output, {});
});

test("lint failure asks the agent to fix the problem", () => {
  const { output } = runHook({ hook_event_name: "SubagentStop" }, "lint");
  assert.equal(output.decision, "block");
  assert.match(output.reason, /fixture lint\/format failure/);
});

test("format failure still runs lint", () => {
  const result = runHook({}, "fmt");
  assert.deepEqual(result.calls, ["fmt", "lint"]);
  assert.equal(result.output.decision, "block");
});

test("continued turns rerun tools without causing an endless continuation loop", () => {
  const result = runHook({ stop_hook_active: true }, "lint");
  assert.deepEqual(result.calls, ["fmt", "lint"]);
  assert.equal(result.output.decision, undefined);
  assert.match(result.output.systemMessage, /pnpm exec oxlint failed/);
});

test("Plan mode checks formatting without writing", () => {
  const result = runHook({ permission_mode: "plan" });
  assert.deepEqual(result.calls, ["fmt:check", "lint"]);
});

test("Claude Stop and SubagentStop use the same failure contract as Codex", () => {
  for (const hook_event_name of ["Stop", "SubagentStop"]) {
    const { output } = runHook({ hook_event_name }, "lint", "claude");
    assert.equal(output.decision, "block");
    assert.match(output.reason, /pnpm exec oxlint failed/);
  }
});

test("Cursor successful stop returns empty JSON", () => {
  const result = runHook(
    { hook_event_name: "stop", status: "completed", loop_count: 0 },
    "",
    "cursor",
  );
  assert.deepEqual(result.calls, ["fmt", "lint"]);
  assert.deepEqual(result.output, {});
});

test("Cursor stop and subagentStop failures return a follow-up message", () => {
  for (const hook_event_name of ["stop", "subagentStop"]) {
    const { output } = runHook(
      { hook_event_name, status: "completed", loop_count: 0 },
      "lint",
      "cursor",
    );
    assert.match(output.followup_message, /pnpm exec oxlint failed/);
    assert.equal(output.decision, undefined);
  }
});

test("Cursor repeated failures still check but do not request another retry", () => {
  const result = runHook(
    { hook_event_name: "stop", status: "completed", loop_count: 1 },
    "lint",
    "cursor",
  );
  assert.deepEqual(result.calls, ["fmt", "lint"]);
  assert.deepEqual(result.output, {});
  assert.match(result.stderr, /pnpm exec oxlint failed/);
});

test("Cursor aborted and errored turns are never restarted", () => {
  for (const status of ["aborted", "error"]) {
    const result = runHook({ hook_event_name: "stop", status, loop_count: 0 }, "lint", "cursor");
    assert.deepEqual(result.output, {});
    assert.match(result.stderr, /pnpm exec oxlint failed/);
  }
});

test("onboarding generates only the current client's local config and is idempotent", () => {
  for (const agent of ["codex", "claude", "cursor"]) {
    const dir = mkdtempSync(join(tmpdir(), "mahol-onboarding-"));
    try {
      const first = setupAgentHooks(agent, dir);
      assert.equal(first.changed, true);
      const config = JSON.parse(readFileSync(join(dir, first.path), "utf8"));
      const events = agent === "cursor" ? ["stop", "subagentStop"] : ["Stop", "SubagentStop"];
      for (const event of events) {
        const entry = config.hooks[event][0];
        const handler = agent === "cursor" ? entry : entry.hooks[0];
        assert.match(handler.command, /\.agents\/hooks\/agent_stop\.mjs/);
        assert.ok(!handler.command.includes("$("));
        assert.ok(handler.command.includes(dir.replaceAll("\\", "/")));
        assert.ok(handler.command.endsWith(`--agent=${agent}`));
      }
      for (const other of ["codex", "claude", "cursor"].filter((name) => name !== agent)) {
        assert.equal(existsSync(join(dir, `.${other}`)), false);
      }
      assert.equal(setupAgentHooks(agent, dir).changed, false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

test("onboarding preserves unrelated settings and hooks without duplicating its own", () => {
  for (const agent of ["codex", "claude", "cursor"]) {
    const dir = mkdtempSync(join(tmpdir(), "mahol-onboarding-"));
    try {
      const first = setupAgentHooks(agent, dir);
      const file = join(dir, first.path);
      const config = JSON.parse(readFileSync(file, "utf8"));
      config.customSetting = "keep this";
      const event = agent === "cursor" ? "stop" : "Stop";
      const unrelated =
        agent === "cursor"
          ? { command: "echo unrelated" }
          : { matcher: "*", hooks: [{ type: "command", command: "echo unrelated" }] };
      config.hooks[event].push(unrelated);
      writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
      setupAgentHooks(agent, dir);
      const updated = JSON.parse(readFileSync(file, "utf8"));
      assert.equal(updated.customSetting, "keep this");
      assert.equal(updated.hooks[event].length, 2);
      assert.deepEqual(updated.hooks[event][0], unrelated);
      assert.equal(setupAgentHooks(agent, dir).changed, false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

test("onboarding rejects unknown clients and unsupported Cursor configs without writing", () => {
  const dir = mkdtempSync(join(tmpdir(), "mahol-onboarding-"));
  try {
    assert.throws(() => setupAgentHooks("unknown", dir), /Choose --agent/);
    assert.equal(existsSync(join(dir, ".unknown")), false);
    mkdirSync(join(dir, ".cursor"));
    const file = join(dir, ".cursor/hooks.json");
    const original = '{"version":99}';
    writeFileSync(file, original);
    assert.throws(() => setupAgentHooks("cursor", dir), /Unsupported Cursor/);
    assert.equal(readFileSync(file, "utf8"), original);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
