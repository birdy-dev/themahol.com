import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const sharedHook = ".agents/hooks/agent_stop.mjs";
const clients = {
  codex: { file: ".codex/hooks.json", events: ["Stop", "SubagentStop"] },
  claude: { file: ".claude/settings.json", events: ["Stop", "SubagentStop"] },
  cursor: { file: ".cursor/hooks.json", events: ["stop", "subagentStop"] },
};

function isSharedHook(handler) {
  return (
    typeof handler.command === "string" &&
    (handler.command.includes(sharedHook) ||
      handler.command.includes("/hooks/agent-stop.mjs") ||
      handler.command.includes("/scripts/agent-stop.mjs"))
  );
}

export function setupAgentHooks(
  agent,
  root = fileURLToPath(new URL("../../../../", import.meta.url)),
) {
  const portableRoot = resolve(root).replaceAll("\\", "/");
  const command = `pnpm --dir "${portableRoot}" exec node "${portableRoot}/${sharedHook}"`;
  const client = clients[agent];
  if (!Object.hasOwn(clients, agent)) throw new Error("Choose --agent codex, claude, or cursor.");
  const file = resolve(root, client.file);
  const before = existsSync(file) ? readFileSync(file, "utf8") : "";
  const config = before ? JSON.parse(before) : {};
  config.hooks ??= {};
  if (agent === "cursor") {
    if (config.version !== undefined && config.version !== 1)
      throw new Error("Unsupported Cursor hooks version.");
    config.version = 1;
  }
  for (const event of client.events) {
    const handler = {
      ...(agent === "cursor" ? {} : { type: "command" }),
      command: `${command} --agent=${agent}`,
      timeout: 120,
      ...(agent === "cursor"
        ? { loop_limit: 1 }
        : { statusMessage: "Formatting with Oxfmt and checking with Oxlint" }),
    };
    const existing = config.hooks[event] ?? [];
    config.hooks[event] =
      agent === "cursor"
        ? [...existing.filter((item) => !isSharedHook(item)), handler]
        : [
            ...existing
              .map((group) => ({
                ...group,
                hooks: group.hooks.filter((item) => !isSharedHook(item)),
              }))
              .filter((group) => group.hooks.length > 0),
            { hooks: [handler] },
          ];
  }
  const after = `${JSON.stringify(config, null, 2)}\n`;
  const changed = before !== after;
  if (changed) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, after);
  }
  return { agent, path: client.file, changed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const index = process.argv.indexOf("--agent");
  const agent = index >= 0 ? process.argv[index + 1] : undefined;
  console.log(JSON.stringify(setupAgentHooks(agent)));
}
