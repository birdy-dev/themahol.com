import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("environment setup works outside the root, with spaces, and preserves existing values", () => {
  const root = mkdtempSync(join(tmpdir(), "mahol setup "));
  try {
    mkdirSync(join(root, "scripts"));
    const script = join(root, "scripts", "setup_env.mjs");
    copyFileSync(new URL("../scripts/setup_env.mjs", import.meta.url), script);
    writeFileSync(join(root, ".env.example"), "STRIPE_SECRET_KEY=\n");
    const run = () => spawnSync(process.execPath, [script], { cwd: tmpdir(), encoding: "utf8" });
    const first = run();
    assert.equal(first.status, 0, first.stderr);
    assert.equal(readFileSync(join(root, ".env"), "utf8"), "STRIPE_SECRET_KEY=\n");
    writeFileSync(join(root, ".env"), "STRIPE_SECRET_KEY=existing-local-value\n");
    const second = run();
    assert.equal(second.status, 0, second.stderr);
    assert.match(second.stdout, /Keeping your existing/);
    assert.equal(
      readFileSync(join(root, ".env"), "utf8"),
      "STRIPE_SECRET_KEY=existing-local-value\n",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
